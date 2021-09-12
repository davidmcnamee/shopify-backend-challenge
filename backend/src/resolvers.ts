import { User, Query, Mutation, UserResolvers, ImageResolvers, ImageOwnershipResolvers, QueryResolvers, ImageMutationsResolvers, UserMutationsResolvers, MutationResolvers, PriceResolvers } from './types/types';
import { db } from './db';
import { User as DbUser, Image as DbImage } from '.prisma/client';
import { CustomContextType } from './types/static';
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

const Ownership: ImageOwnershipResolvers<CustomContextType, DbImage> = {
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
    updateImage: (_parent, args, context, info) => {

    },
    uploadImage: (_parent, args, context, info) => {
    },
    uploadImages: (_parent, args, context, info) => {
        assertUserExists(context.user);
        const imageHashes = [];
        for(const input of args.input) {
            const { forSale, public: isPublic, url, price } = input;
            
        }
        const images = db.image.findFirst({where: { OR: [{url}] }}) // TODO: check hash also
        db.image.createMany({
            data: []
        })
    },
    uploadImagesFromFile: (_parent, args, context, info) => {

    },
}

const UserMutations: UserMutationsResolvers = {
    login: (_parent, args, context, info) => {

    },
    register: (_parent, args, context, info) => {

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
    Ownership,
}
