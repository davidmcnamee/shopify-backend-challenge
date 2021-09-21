/** @format */

import {User} from ".prisma/client";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {JobControllerClient} from "@google-cloud/dataproc";
import {google} from "@google-cloud/dataproc/build/protos/protos";
import {imageHash as originalImageHash} from "image-hash";
import {
    uniqueNamesGenerator,
    colors,
    adjectives,
    animals,
} from "unique-names-generator";
import {promisify} from "util";
import {s3} from "./db";
import type {LROperation} from "google-gax/build/src/clientInterface";
import {db} from "./db";
import {ImageQuery} from "./types/types";

type IJob = google.cloud.dataproc.v1.IJob;
type IJobMetadata = google.cloud.dataproc.v1.IJobMetadata;

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

type CompleteJobAsync = (
    jobOperation: LROperation<IJob, IJobMetadata>,
    user: User,
) => Promise<void>;

export const completeUploadJobAsync: CompleteJobAsync = async (
    jobOperation,
    user,
) => {
    const [jobResponse] = await jobOperation.promise();
    const fileNameMatch =
        jobResponse.driverOutputResourceUri.match("gs://(.*?)/(.*)");
    const storage = new Storage();
    const [outputLogs] = await storage
        .bucket(fileNameMatch[1])
        .file(`${fileNameMatch[2]}.000000000`)
        .download();
    // there's probably a better way to extract the job results from spark,
    // but since I'm crunched for time, we'll just use a regex.
    const [, result] = outputLogs
        .toString()
        .match("(?:\n|^)SCRIPT RESULTS: (.*?)(?:\n|$)");
    const rows = JSON.parse(result);
    const successCount = await db.image.createMany({
        data: rows.map((row: object) => ({
            hash: row[0],
            url: row[1],
            price: row[2],
            currency: row[3],
            discount: row[4],
            for_sale: row[5],
            public: row[6],
            title: row[7],
            uploaderId: user.id,
            ownerId: user.id,
        })),
    });
    console.log("SUCCESS: ", successCount);
};

export function parseImageQueryArgs(query: ImageQuery) {
    const {sort, limit, offset, ascending} = query;
    const direction = ascending ? "asc" : "desc";
    const orderBy = (
        {
            PRICE: {amount: direction},
            LIKES: {likes: {_count: direction}},
            UPLOAD_DATE: {createdAt: direction},
        } as const
    )[sort];
    return {orderBy, take: limit, skip: offset};
}