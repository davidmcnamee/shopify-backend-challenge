/** @format */

import {ApolloError} from "apollo-server-errors";

export const errors = {
    UNEXPECTED_ERROR: "An unexpected error occurred.",
    INVALID_LOGIN: "Invalid username or password.",
    USER_NOT_FOUND: "We could not find that username in our system.",
    DUPLICATE_USERNAME: "That username is already in use.",
    IMAGE_DOES_NOT_EXIST: "The image specified does not exist.",
    IMAGE_NOT_FOR_SALE: "That image is not for sale.",
    UNAUTHORIZED_USER: "You are not authorized to perform this action.",
    UNAUTHENTICATED_USER: "You must be logged in to perform this action.",
    DUPLICATE_IMAGE_UPLOAD: "Cannot reupload a duplicate image.",
    INVALID_FILE_EXTENSION: "Invalid file extension.",
};

type ErrorCode = keyof typeof errors;

export function createError(code: ErrorCode) {
    return new ApolloError(errors[code], code);
}
