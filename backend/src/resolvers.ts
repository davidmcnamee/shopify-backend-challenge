import { Image as DbImage, User as DbUser } from '.prisma/client';
import { zip } from 'lodash';
import { db } from './db';
import { computeHash, generateImageName } from './helpers';
import { ClientError } from './types/exceptions';
import { CustomContextType } from './types/static';
import { ImageMutationsResolvers, ImageOwnershipResolvers, ImageResolvers, Mutation, MutationResolvers, Query, QueryResolvers, User, UserMutationsResolvers, UserResolvers } from './types/types';
import { assertIsCorrectUser, assertUserExists } from './validators';

const User: UserResolvers<CustomContextType, DbUser> = {
    email: (parent, _args, context) => {
        assertIsCorrectUser(context.user, parent.id);
        return parent.email;
    },
    inventory: async (parent, args, context, info) => {
        const isCurrentUser = context.user.id === parent.id;
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
    return {OR: [{ public: true }, context.user && { ownerId: context.user.id }]}
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

const ImageMutations: ImageMutationsResolvers<CustomContextType> = {
    purchaseImage: async (_parent, args, context, info) => {
        
        return true
    },
    updateImage: async (_parent, args, context, info) => {
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
    uploadImage: async (_parent, args, context, info) => {
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
                uploaderId: context.user.id,
                ownerId: context.user.id,
            },
        });
        return image;
    },
    uploadImages: async (_parent, args, context, info) => {
        assertUserExists(context.user);
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
                uploaderId: context.user.id,
                ownerId: context.user.id,
            }))
        })
        return images;
    },
    uploadImagesFromFile: (_parent, args, context, info) => {
        // TODO: implement
    },
}

const UserMutations: UserMutationsResolvers = {
    login: (_parent, args, context, info) => {
        // TODO: implement
        return db.user.findUnique({where:{username: args.input.username}});
    },
    register: (_parent, args, context, info) => {
        // TODO: implement
        console.log({...args})
        return db.user.create({data:{ ...args.input }});
    },
}

const Mutation: MutationResolvers<CustomContextType, undefined> = {
    images: () => ImageMutations,
    users: () => UserMutations,
}

export const resolvers = {
    User,
    Image: ImageType,
    Query,
    Mutation,
    ImageOwnership,
}
