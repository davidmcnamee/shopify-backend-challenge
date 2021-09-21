/** @format */

import { Image as DbImage, User as DbUser } from ".prisma/client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dataproc from "@google-cloud/dataproc";
import type { google } from "@google-cloud/dataproc/build/protos/protos";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import bcrypt from "bcryptjs";
import {floor, zip} from "lodash";
import {Stripe} from "stripe";
import {v4 as uuidv4} from "uuid";
import {db, s3} from "./db";
import { stripe } from "./stripe";
import {createError} from "./types/external-errors";
import {CustomContextType} from "./types/static";
import {
    ImageMutationsDeleteImageArgs,
    ImageMutationsSetLikeArgs,
    ImageMutationsUpdateImageArgs,
    ImageMutationsUploadImageArgs,
    ImageMutationsUploadImagesArgs,
    ImageMutationsUploadImagesFromFileArgs,
    ImageOwnershipResolvers,
    ImageResolvers,
    Mutation,
    MutationResolvers,
    ObjectResolvers,
    Query,
    QueryResolvers,
    User,
    UserMutations,
    UserMutationsFollowArgs,
    UserMutationsLoginArgs,
    UserMutationsRegisterArgs,
    UserResolvers,
} from "./types/types";
import {
    completeUploadJobAsync,
    generateImageName,
    parseImageQueryArgs,
} from "./util";
import {
    assertCorrectUser,
    assertFileExtensionsAllowed,
    assertImageExists,
    assertImageIsPurchaseable,
    assertImagesUnique,
    assertPriceValid,
    assertUserExists,
} from "./validators";

type IJobMetadata = google.cloud.dataproc.v1.IJobMetadata;

const clusterClient = new dataproc.v1.ClusterControllerClient({
    apiEndpoint: `${process.env.GCP_REGION}-dataproc.googleapis.com`,
    projectId: process.env.GCP_PROJECT_ID,
});
const jobClient = new dataproc.v1.JobControllerClient({
    apiEndpoint: `${process.env.GCP_REGION}-dataproc.googleapis.com`,
    projectId: process.env.GCP_PROJECT_ID,
});

const User: UserResolvers<CustomContextType, DbUser> = {
    followingStatus: async (parent, args, context) => {
        if (!context.getUser()) return "NOT_FOLLOWING";
        const following = await db.following.findUnique({
            where: {
                followerId_followeeId: {
                    followerId: context.getUser().id,
                    followeeId: parent.id,
                },
            },
        });
        if (!following) return "NOT_FOLLOWING";
        if (!following.paid) return "FOLLOWING_UNPAID";
        return "FOLLOWING_PAID";
    },
    email: async (parent, _args, context) => {
        assertCorrectUser(context.getUser(), parent.id);
        return parent.email;
    },
    ownedImages: async (parent, args, context, info) => {
        const imageQueryProps = parseImageQueryArgs(args.query);
        return db.image.findMany({
            ...imageQueryProps,
            where: {
                ...publicOrOwned(context),
                ownerId: parent.id,
            },
        });
    },
    following: async (parent, args, context, info) => {
        return db.user.findMany({
            where: {
                following: {some: {followeeId: parent.id}},
            },
        });
    },
    followers: async (parent, args, context, info) => {
        return db.user.findMany({
            where: {
                following: {some: {followerId: parent.id}},
            },
        });
    },
    price: async (parent, args, context, info) => {
        if (!parent.forSale) return null;
        return parent;
    },
    acceptingPayments: async (parent, _args, context) => {
        assertCorrectUser(context.getUser(), parent.id);
        if (!parent.stripeAccountId) return false;
        const stripeAccount = await stripe.accounts.retrieve(parent.stripeAccountId);
        if (stripeAccount.details_submitted) return true;
        return false;
    },
};

const ImageType: ImageResolvers<CustomContextType, DbImage> = {
    ownership: parent => parent,
    price: parent => {
        if (parent.forSale)
            return parent;
        return null;
    },
    url: async parent => {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: parent.url,
        });
        return getSignedUrl(s3, command, {expiresIn: 5});
    },
    likes: parent => {
        return db.likes.count({
            where: {
                imageId: parent.id,
            },
        });
    },
    likedByMe: async (parent, _args, context) => {
        if (!context.getUser()) return false;
        const like = await db.likes.findUnique({
            where: {
                userId_imageId: {
                    imageId: parent.id,
                    userId: context.getUser().id,
                },
            },
        });
        return !!like;
    },
};

const ImageOwnership: ImageOwnershipResolvers<CustomContextType, DbImage> = {
    owner: (parent, args, context, info) => {
        return db.user.findUnique({where: {id: parent.ownerId}});
    },
    uploader: (parent, args, context, info) => {
        return db.user.findUnique({where: {id: parent.uploaderId}});
    },
};

function publicOrOwned(context: CustomContextType) {
    return {
        OR: [{public: true}, context.getUser() && {ownerId: context.getUser().id}],
    };
}

const ObjectType: ObjectResolvers<CustomContextType> = {
    __resolveType: (parent, context, info) => {
        if ((parent as any).url) {
            return "Image";
        }
        return "User";
    },
};

const Query: QueryResolvers<CustomContextType> = {
    search: async (_parent, args, context, info) => {
        console.log("SEARCH QUERY: ", args.query);
        const matchingImages = db.image.findMany({
            where: {
                title: {contains: args.query},
                // OR: [
                //     {title: {contains: args.query, mode: "insensitive"}},
                //     {id: {contains: args.query, mode: "insensitive"}},
                // ],
                ...publicOrOwned(context),
            },
        });
        const matchingUsers = db.user.findMany({
            where: {
                OR: [
                    {username: {contains: args.query}},
                    {id: {contains: args.query}},
                ],
            },
        });
        const [images, users] = await Promise.all([matchingImages, matchingUsers]);
        console.log("MATCHING USERS AND IMAGES: ", users, images);
        console.log(args.query, images, users);
        return [...images, ...users];
    },
    images: (_parent, args, context, info) => {
        const imageQueryProps = parseImageQueryArgs(args.query);
        return db.image.findMany({
            ...imageQueryProps,
            where: {
                ...publicOrOwned(context),
            },
        });
    },
    get: async (_parent, args, context, info) => {
        const matchingImage = db.image.findFirst({
            where: {id: args.id, ...publicOrOwned(context)},
        });
        const matchingUser = db.user.findUnique({where: {id: args.id}});
        const [image, user] = await Promise.all([matchingImage, matchingUser]);
        return image || user;
    },
    imageUploadUrls: async (_parent, args, context, info) => {
        assertUserExists(context.getUser());
        assertFileExtensionsAllowed(args.fileExtensions);
        const promises = [];
        const keys = [];
        for (let fileExtension of args.fileExtensions) {
            const key =
                context.getUser().username +
                "_" +
                new Date().getTime() +
                "_" +
                uuidv4() +
                "." +
                fileExtension;
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
            });
            promises.push(getSignedUrl(s3, command, {expiresIn: 5 * 60}));
            keys.push(key);
        }
        return zip(await Promise.all(promises), keys).map(([signedUrl, key]) => ({
            signedUrl,
            key,
        }));
    },
    me: async (_parent, args, context) => {
        return context.getUser();
    },
    user: async (_parent, args, context, info) => {
        return db.user.findUnique({where: {username: args.username}});
    },
};

const ImageMutations = {
    updateImage: async (
        args: ImageMutationsUpdateImageArgs,
        context: CustomContextType,
    ) => {
        const {forSale, price, public: isPublic, title, id} = args.input;
        if (forSale && !price) throw createError("FOR_SALE_IMAGE_MUST_HAVE_PRICE");
        assertUserExists(context.getUser());
        let image = await db.image.findUnique({where: {id}});
        assertCorrectUser(context.getUser(), image.ownerId);
        if(price) assertPriceValid(price);
        image = await db.image.update({
            where: {id},
            data: {
                forSale,
                title,
                public: isPublic,
                amount: price?.amount,
                currency: price?.currency,
                discount: price?.discount,
            },
        });
        return image;
    },
    uploadImage: async (
        args: ImageMutationsUploadImageArgs,
        context: CustomContextType,
    ) => {
        assertUserExists(context.getUser());
        const [hash] = await assertImagesUnique([args.input.url]);
        if(args.input.price) assertPriceValid(args.input.price);
        const image = await db.image.create({
            data: {
                hash: hash,
                url: args.input.url,
                title: args.input.title || generateImageName(),
                amount: args.input.price?.amount,
                currency: args.input.price?.currency,
                discount: args.input.price?.discount,
                forSale: args.input.forSale,
                public: args.input.public,
                uploaderId: context.getUser().id,
                ownerId: context.getUser().id,
            },
        });
        return image;
    },
    uploadImages: async (
        args: ImageMutationsUploadImagesArgs,
        context: CustomContextType,
    ) => {
        assertUserExists(context.getUser());
        const imageHashes = await assertImagesUnique(
            args.input.map(input => input.url),
        );
        const [, images] = await db.$transaction([
            db.image.createMany({
                data: zip(args.input, imageHashes).map(([input, hash]) => ({
                    hash: hash,
                    url: input.url,
                    title: input.title || generateImageName(),
                    amount: input.price?.amount,
                    currency: input.price?.currency,
                    discount: input.price?.discount,
                    forSale: input.forSale,
                    public: input.public,
                    uploaderId: context.getUser().id,
                    ownerId: context.getUser().id,
                })),
            }),
            db.image.findMany({where: {hash: {in: imageHashes}}}),
        ]);
        return images;
    },
    uploadImagesFromFile: async (
        args: ImageMutationsUploadImagesFromFileArgs,
        context: CustomContextType,
    ) => {
        assertUserExists(context.getUser());
        const [cluster] = await clusterClient.getCluster({
            clusterName: process.env.DATAPROC_CLUSTER_NAME,
            projectId: process.env.GCP_PROJECT_ID,
            region: process.env.GCP_REGION,
        });
        const gcsScript = `gs://${process.env.GCS_BUCKET_NAME}/bulk-upload.py`;
        const job: google.cloud.dataproc.v1.ISubmitJobRequest = {
            projectId: process.env.GCP_PROJECT_ID,
            region: process.env.GCP_REGION,
            job: {
                placement: {
                    clusterName: cluster.clusterName,
                },
                pysparkJob: {
                    mainPythonFileUri: gcsScript,
                    args: [args.url],
                    properties: {
                        "spark.executorEnv.AWS_ACCESS_KEY_ID":
                            process.env.AWS_ACCESS_KEY_ID,
                        "spark.executorEnv.AWS_SECRET_ACCESS_KEY":
                            process.env.AWS_SECRET_ACCESS_KEY,
                    },
                },
            },
        };
        const [jobOperation] = await jobClient.submitJobAsOperation(job);
        const {jobId} = jobOperation.metadata as IJobMetadata;

        completeUploadJobAsync(jobOperation, context.getUser());
        return jobOperation.name;
    },
    setLike: async (args: ImageMutationsSetLikeArgs, context: CustomContextType) => {
        assertUserExists(context.getUser());
        if (args.like)
            await db.likes.create({
                data: {
                    imageId: args.id,
                    userId: context.getUser().id,
                },
            });
        else
            await db.likes.delete({
                where: {
                    userId_imageId: {
                        imageId: args.id,
                        userId: context.getUser().id,
                    },
                },
            });
        return db.image.findUnique({where: {id: args.id}});
    },
    deleteImage: async (args: ImageMutationsDeleteImageArgs, context: CustomContextType) => {
        const image = await db.image.findUnique({where: {id: args.id}});
        assertCorrectUser(context.getUser(), image.ownerId)
        await db.image.delete({
            where: {id: args.id},
        });
        return true;
    }
};

const UserMutations = {
    follow: async (args: UserMutationsFollowArgs, context: CustomContextType) => {
        assertUserExists(context.getUser());
        const followee = await db.user.findUnique({where: {id: args.id}});
        assertUserExists(followee);
        const primaryKey = {
            followerId_followeeId: {
                followerId: context.getUser().id,
                followeeId: args.id,
            },
        };
        if (args.value === "NOT_FOLLOWING") {
            await db.following.delete({
                where: primaryKey,
            });
            return null;
        } else if (args.value === "FOLLOWING_UNPAID") {
            await db.following.create({
                data: {
                    followerId: context.getUser().id,
                    followeeId: args.id,
                    paid: false,
                },
            });
            return null;
        }
        // FOLLOWING_PAID
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    name: `Premium Follower to ${followee.username}`,
                    amount: floor(followee.amount * (1 - followee.discount / 10000)),
                    currency: followee.currency,
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: 0,
                transfer_data: {
                    destination: followee.stripeAccountId,
                },
            },
            mode: "payment",
            success_url: `${process.env.FRONTEND_ORIGIN}/u/${followee.username}`,
            cancel_url: `${process.env.FRONTEND_ORIGIN}/u/${followee.username}`,
        });
        return session.url;
    },
    updateSettings: async (args, context) => {
        const user = context.getUser();
        assertUserExists(user);
        const {forSale, price} = args.input;
        if (forSale) {
            if (!price) throw createError("FOR_SALE_USER_MUST_HAVE_PRICE");
            if (!user.stripeAccountId)
                throw createError("FOR_SALE_USER_STRIPE_UNVERIFIED");
            const stripeAccount = await stripe.accounts.retrieve(
                user.stripeAccountId,
            );
            if (!stripeAccount.details_submitted)
                throw createError("FOR_SALE_USER_STRIPE_UNVERIFIED");
            assertPriceValid(price);
        }
        return db.user.update({
            where: {id: user.id},
            data: {
                forSale,
                amount: price?.amount,
                discount: price?.discount,
                currency: price?.currency,
            },
        });
    },
    login: async (args: UserMutationsLoginArgs, context: CustomContextType) => {
        const {user} = await context.authenticate("graphql-local", {
            email: args.input.username,
            password: args.input.password,
        });
        await context.login(user);
        return user;
    },
    register: async (
        args: UserMutationsRegisterArgs,
        context: CustomContextType,
    ) => {
        const passwordHash = await bcrypt.hash(args.input.password, 10);
        try {
            const stripeAccount = await stripe.accounts.create({type: "express"});
            const user = await db.user.create({
                data: {
                    username: args.input.username,
                    email: args.input.email,
                    password: passwordHash,
                    stripeAccountId: stripeAccount.id,
                },
            });
            await context.login(user);
            return user;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === "P2002")
                throw createError("DUPLICATE_USERNAME");
        }
    },
    linkStripeAccount: async (_args: never, context: CustomContextType) => {
        const user = context.getUser();
        assertUserExists(user);
        let stripeAccount: Stripe.Account = null;
        if (user.stripeAccountId)
            stripeAccount = await stripe.accounts.retrieve(user.stripeAccountId);
        else {
            stripeAccount = await stripe.accounts.create({type: "express"});
            await db.user.update({
                where: {id: user.id},
                data: {stripeAccountId: stripeAccount.id},
            });
        }
        const accountLinks = await stripe.accountLinks.create({
            account: stripeAccount.id,
            refresh_url: `${process.env.FRONTEND_ORIGIN}/u/${user.username}`,
            return_url: `${process.env.FRONTEND_ORIGIN}/u/${user.username}`,
            type: "account_onboarding",
        });
        return accountLinks.url;
    },
};

const Mutation: MutationResolvers<CustomContextType> = {
    images: () => ImageMutations,
    users: () => UserMutations,
};

export const resolvers = {
    User,
    Image: ImageType,
    Query,
    ImageOwnership,
    Mutation,
    Object: ObjectType,
};
