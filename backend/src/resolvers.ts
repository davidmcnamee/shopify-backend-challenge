/** @format */

import {Image as DbImage, Image, Prisma, User as DbUser} from ".prisma/client";
import {zip} from "lodash";
import {db, s3} from "./db";
import {completeUploadJobAsync, generateImageName} from "./util";
import {CustomContextType} from "./types/static";
import dataproc from "@google-cloud/dataproc";
import {Storage} from "@google-cloud/storage";
import {
    ImageMutationsLikeArgs,
    ImageMutationsPurchaseImageArgs,
    ImageMutationsResolvers,
    ImageMutationsUnlikeArgs,
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
    UserMutationsLoginArgs,
    UserMutationsRegisterArgs,
    UserMutationsResolvers,
    UserResolvers,
} from "./types/types";
import {
    assertImageExists,
    assertImageIsPurchaseable,
    assertCorrectUser,
    assertUserExists,
    assertImagesUnique,
    assertFileExtensionsAllowed,
} from "./validators";
import bcrypt from "bcryptjs";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {S3Client, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {v4 as uuidv4} from "uuid";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";
import {createError} from "./types/external-errors";
import type {google} from "@google-cloud/dataproc/build/protos/protos";
import {Stripe} from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
});

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
    email: async (parent, _args, context) => {
        assertCorrectUser(context.getUser(), parent.id);
        return parent.email;
    },
    inventory: async (parent, args, context, info) => {
        const isCurrentUser = context.getUser().id === parent.id;
        return db.image.findMany({
            where: {
                ownerId: parent.id,
                public: !isCurrentUser ? true : undefined,
            },
        });
    },
    acceptingPayments: async (parent, _args, context) => {
        assertCorrectUser(context.getUser(), parent.id);
        if(!parent.stripeAccountId) return false;
        const stripeAccount = await stripe.accounts.retrieve(parent.stripeAccountId);
        if(stripeAccount.details_submitted) return true;
        return false;
    },
};

const ImageType: ImageResolvers<CustomContextType, DbImage> = {
    ownership: parent => parent,
    price: parent => parent,
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
        const matchingImages = db.image.findMany({
            where: {
                OR: {
                    title: {contains: args.query},
                    id: {contains: args.query},
                },
                ...publicOrOwned(context),
            },
        });
        const matchingUsers = db.user.findMany({
            where: {
                OR: {
                    username: {contains: args.query},
                    id: {contains: args.query},
                },
            },
        });
        const [images, users] = await Promise.all([matchingImages, matchingUsers]);
        console.log(args.query, images, users);
        return [...images, ...users];
    },
    images: (_parent, args, context, info) => {
        return db.image.findMany();
    },
    get: async (_parent, args, context, info) => {
        const matchingImage = db.image.findUnique({
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
            promises.push(getSignedUrl(s3, command, {expiresIn: 5}));
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
};

const ImageMutations = {
    purchaseImage: async (
        args: ImageMutationsPurchaseImageArgs,
        context: CustomContextType,
    ) => {
        assertUserExists(context.getUser());
        const image = await db.image.findUnique({where: {id: args.input.imageID}});
        assertImageExists(image);
        assertImageIsPurchaseable(image, context.getUser());
        return db.image.update({
            where: {id: args.input.imageID},
            data: {ownerId: context.getUser().id, forSale: false},
        });
    },
    updateImage: async (
        args: ImageMutationsUpdateImageArgs,
        context: CustomContextType,
    ) => {
        const {forSale, price, public: isPublic, title, id} = args.input;
        assertUserExists(context.getUser());
        assertCorrectUser(context.getUser(), id);
        const image = await db.image.update({
            where: {id},
            data: {
                forSale,
                title,
                public: isPublic,
                amount: price.amount,
                currency: price.currency,
                discount: price.discount,
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
    like: async (args: ImageMutationsLikeArgs, context: CustomContextType) => {
        assertUserExists(context.getUser());
        await db.likes.create({
            data: {
                imageId: args.id,
                userId: context.getUser().id,
            },
        });
        return true;
    },
    unlike: async (args: ImageMutationsUnlikeArgs, context: CustomContextType) => {
        assertUserExists(context.getUser());
        await db.likes.delete({
            where: {
                userId_imageId: {
                    imageId: args.id,
                    userId: context.getUser().id,
                },
            },
        });
        return true;
    },
};

const UserMutations = {
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
            const user = await db.user.create({
                data: {
                    username: args.input.username,
                    email: args.input.email,
                    password: passwordHash,
                },
            });
            await context.login(user);
            return user;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === "P2002")
                throw createError("DUPLICATE_USERNAME");
        }
    },
    createStripeAccount: async (_args: never, context: CustomContextType) => {
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
            refresh_url: `${process.env.FRONTEND_ORIGIN}/settings`,
            return_url: `${process.env.FRONTEND_ORIGIN}/settings`,
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
