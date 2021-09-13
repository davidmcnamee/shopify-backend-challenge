import { Image as DbImage, User as DbUser } from '.prisma/client';
import { zip } from 'lodash';
import { db } from './db';
import { computeHash, generateImageName } from './helpers';
import { ClientError } from './types/exceptions';
import { CustomContextType } from './types/static';
import { ImageMutationsPurchaseImageArgs, ImageMutationsUpdateImageArgs, ImageMutationsUploadImageArgs, ImageMutationsUploadImagesArgs, ImageMutationsUploadImagesFromFileArgs, ImageOwnershipResolvers, ImageResolvers, Mutation, MutationResolvers, Query, QueryResolvers, User, UserMutations, UserMutationsLoginArgs, UserMutationsRegisterArgs, UserMutationsResolvers, UserResolvers } from './types/types';
import { assertIsCorrectUser, assertUserExists } from './validators';

const User: UserResolvers<CustomContextType, DbUser> = {
    email: async (parent, _args, context) => {
        await context.authenticate("graphql-local");
        assertIsCorrectUser(context.getUser(), parent.id);
        return parent.email;
    },
    inventory: async (parent, args, context, info) => {
        const isCurrentUser = context.getUser().id === parent.id;
        return db.image.findMany({where: {
            ownerId: parent.id,
            public: !isCurrentUser ? true : undefined
        }});
    }
}

const ImageType: ImageResolvers<CustomContextType, DbImage> = {
    ownership: (parent) => parent,
    price: (parent) => parent,
}

const ImageOwnership: ImageOwnershipResolvers<CustomContextType, DbImage> = {
    owner: (parent, args, context, info) => {
        return db.user.findUnique({where: {id: parent.ownerId}});
    },
    uploader: (parent, args, context, info) => {
        return db.user.findUnique({where: {id: parent.uploaderId}});
    },
};

function publicOrOwned(context: CustomContextType) {
    return {OR: [{ public: true }, context.getUser() && { ownerId: context.getUser().id }]}
}

const Query: QueryResolvers<CustomContextType> = {
    search: async (_parent, args, context, info) => {
        const matchingImages = db.image.findMany({where: {
            title: { contains: args.query },
            ...publicOrOwned(context)
        }});
        const matchingUsers = db.user.findMany({where: { username: { contains: args.query } }});
        const [images, users] = await Promise.all([matchingImages, matchingUsers]);
        return [...images, ...users];
    },
    images: (_parent, args, context, info) => {
        return db.image.findMany();
    },
    get: async (_parent, args, context, info) => {
        const matchingImage = db.image.findUnique({where: {id: args.id, ...publicOrOwned(context)}});
        const matchingUser = db.user.findUnique({where: {id: args.id}});
        const [image, user] = await Promise.all([matchingImage, matchingUser]);
        return image || user;
    }
}

const ImageMutations = {
    purchaseImage: async (args:ImageMutationsPurchaseImageArgs, context:CustomContextType) => {
        
        return true
    },
    updateImage: async (args:ImageMutationsUpdateImageArgs, context:CustomContextType) => {
        const { forSale, price, public: isPublic, title, id } = args.input;
        const image = await db.image.update({
            where: { id },
            data: {
                forSale,
                title,
                public: isPublic,
                amount: price.amount,
                currency: price.currency,
                discount: price.discount,
            },
        })
        return image;
    },
    uploadImage: async (args:ImageMutationsUploadImageArgs, context:CustomContextType) => {
        const hash = await computeHash(args.input.url);
        const duplicateImage = db.image.findFirst({where: { hash }});
        if(duplicateImage) throw new ClientError(400, "Cannot reupload a duplicate image.");
        const image = await db.image.create({
            data: {
                hash: hash,
                url: args.input.url,
                title: args.input.title || generateImageName(),
                amount: args.input.price.amount,
                currency: args.input.price.currency,
                discount: args.input.price.discount,
                forSale: args.input.forSale,
                public: args.input.public,
                uploaderId: context.getUser().id,
                ownerId: context.getUser().id,
            },
        });
        return image;
    },
    uploadImages: async (args:ImageMutationsUploadImagesArgs, context:CustomContextType) => {
        assertUserExists(context.getUser());
        const imageHashes = await Promise.all(args.input.map(input => computeHash(input.url)));
        const duplicateImage = db.image.findFirst({where: { hash: { in: imageHashes } }})
        if(duplicateImage) throw new ClientError(400, "Cannot reupload a duplicate image.");
        const images = await db.image.createMany({
            data: zip(args.input, imageHashes).map(([input, hash]) => ({
                hash: hash,
                url: input.url,
                title: input.title || generateImageName(),
                amount: input.price.amount,
                currency: input.price.currency,
                discount: input.price.discount,
                forSale: input.forSale,
                public: input.public,
                uploaderId: context.getUser().id,
                ownerId: context.getUser().id,
            }))
        })
        return images;
    },
    uploadImagesFromFile: (args:ImageMutationsUploadImagesFromFileArgs, context:CustomContextType) => {
        // TODO: implement
    },
}

const UserMutations = {
    login: async (args:UserMutationsLoginArgs, context:CustomContextType) => {
        const { user, info } = await context.authenticate("graphql-local", {
            email: args.input.username,
            password: args.input.password,
        });
        await context.login(user);
        return user;
    },
    register: async (args:UserMutationsRegisterArgs, context:CustomContextType) => {
        const user = await db.user.create({data:{
            username: args.input.username,
            email: args.input.email,
            password: args.input.password,
        }});
        await context.login(user);
        return user;
    },
}

const Mutation: MutationResolvers<CustomContextType> = {
    images: () => ImageMutations,
    users: () => UserMutations,
}

export const resolvers = {
    User,
    Image: ImageType,
    Query,
    ImageOwnership,
    Mutation
}
