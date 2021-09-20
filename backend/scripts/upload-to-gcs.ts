/** @format */
// uploads pyspark scripts to GCS (to be used by dataproc cluster)
import dotenv from "dotenv";
dotenv.config();
import {Storage} from "@google-cloud/storage";
import fs from "fs";

async function main() {
    const jobFile = "bulk-upload.py";
    const jobFileContent = fs.readFileSync(__dirname + "/bulk-upload.py", "utf8");
    const testCsv = "test-bulk-upload.csv";
    const testCsvContent = fs.readFileSync(
        __dirname + "/../tests/assets/test-bulk-upload.csv",
        "utf8",
    );

    const storage = new Storage();
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    await bucket.file(jobFile).save(jobFileContent);
    await bucket.file(testCsv).delete();
    await bucket.file(testCsv).save(testCsvContent);
    await bucket.file(testCsv).makePublic();
    console.log("done uploading");
}

main();
