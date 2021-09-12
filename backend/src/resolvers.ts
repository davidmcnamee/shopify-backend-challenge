import { User, Image, Query, Mutation } from './types';

const User: User = {
    inventory: () => {
        
    }
}

const ImageType: Image = {
    ownership: (parent) => parent,
    price: (parent) => parent
}

const Query: Query = {
    search: (parent, args, context, info) => null,
    images: (parent, args, context, info) => null,
    get: (parent, args, context, info) => null
}

const Mutation: Mutation = {
    images: {
        purchaseImage: (parent, args, context, info) => {

        },
        updateImage: (parent, args, context, info) => {

        },
        uploadImage: (parent, args, context, info) => {

        },
        uploadImages: (parent, args, context, info) => {

        },
        uploadImagesFromFile: (parent, args, context, info) => {

        },
    },
    users: {
        login: (parent, args, context, info) => {

        },
        register: (parent, args, context, info) => {

        },
    }
}

export const resolvers = {
    User,
    Image: ImageType,
    Query,
    Mutation
}
