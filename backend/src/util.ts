/** @format */

import {User} from ".prisma/client";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {imageHash as originalImageHash} from "image-hash";
import {
    uniqueNamesGenerator,
    colors,
    adjectives,
    animals,
} from "unique-names-generator";
import {promisify} from "util";
import {s3} from "./db";

const SEED = 7834950847328;
const imageHash = promisify(originalImageHash);

export async function computeHash(url: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: url,
    });
    const signedUrl = await getSignedUrl(s3, command, {expiresIn: 3600});
    return (await imageHash(signedUrl, 16, true)) as string;
}

export function generateImageName() {
    return uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        style: "lowerCase",
        seed: SEED,
        separator: "-",
    });
}

export function serializeUser(user: User) {
    return {id: user.id, username: user.username, email: user.email};
}
