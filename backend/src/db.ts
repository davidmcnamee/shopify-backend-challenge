/** @format */

import {S3Client} from "@aws-sdk/client-s3";
import {PrismaClient} from "@prisma/client";

export const db = new PrismaClient();
export const s3 = new S3Client({region: process.env.AWS_REGION});
