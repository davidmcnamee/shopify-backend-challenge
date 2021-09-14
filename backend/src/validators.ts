/** @format */

import {User, Image} from "@prisma/client";
import {db} from "./db";
import {createError} from "./types/external-errors";
import {computeHash} from "./util";

export function assertFileExtensionsAllowed(fileExtensions: string[]) {
    for (let fileExtension of fileExtensions) {
        if (!["jpg", "jpeg", "png", "gif"].includes(fileExtension))
            throw createError("INVALID_FILE_EXTENSION");
    }
}

export function assertUserExists(user: User | null) {
    if (!user) throw createError("UNAUTHENTICATED_USER");
}

export function assertImageExists(image: Image | null) {
    if (!image) throw createError("IMAGE_DOES_NOT_EXIST");
}

export function assertImageIsPurchaseable(image: Image, buyer: User) {
    if (!image.forSale) throw createError("IMAGE_NOT_FOR_SALE");
    // TODO: do currency conversions and check price, remove buyer param
}

export function assertCorrectUser(user: User, expectedUserId: string) {
    if (!isCorrectUser(user, expectedUserId)) throw createError("UNAUTHORIZED_USER");
}

export function isCorrectUser(user: User, expectedUserId: string) {
    return user.id === expectedUserId;
}

export async function assertImagesUnique(urls: string[]) {
    const imageHashes = await Promise.all(urls.map(computeHash));
    const duplicateImage = await db.image.findFirst({
        where: {hash: {in: imageHashes}},
    });
    if (duplicateImage) throw createError("DUPLICATE_IMAGE_UPLOAD");
    return imageHashes;
}
