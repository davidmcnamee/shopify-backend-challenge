import { User, Image } from "@prisma/client";
import { AuthorizationError, ClientError } from "./types/exceptions";


export function assertUserExists(user: User | null) {
    if(!user)
        throw new AuthorizationError(401, "You must be logged in to perform this action.");
}

export function assertImageIsPurchaseable(image: Image, buyer: User) {
    if(!image.forSale)
        throw new ClientError(401, "That image is not for sale!");
    // TODO: do currency conversions and check price
}

export function assertIsCorrectUser(user: User, expectedUserId: string) {
    if(!isCorrectUser(user, expectedUserId))
        throw new AuthorizationError(403, "You are not authorized to perform this action.");
}

export function isCorrectUser(user: User, expectedUserId: string) {
    return user.id === expectedUserId;
}
