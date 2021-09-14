/** @format */

import request from "supertest";
import {assert} from "chai";
import {Server} from "http";
import {db} from "../src/db";
import axios from "axios";
import fs from "fs";

export async function createTestUser(app: Server) {
    const response = await request(app)
        .post("/graphql")
        .send({
            query: `
        mutation RegisterNewUser($input: RegisterInput!) {
          users {
            register(input: $input) {
              id
              username
              email
            }
          }
        }        
      `,
            variables: {
                input: {
                    username: "david",
                    email: "david@email.com",
                    password: "password",
                },
            },
        });
    assert.equal(response.status, 200);
    const responseData = response.body.data.users.register;
    assert.equal(responseData.username, "david");
    assert.equal(responseData.email, "david@email.com");
    return {userResponse: response, user: responseData};
}

export async function clearDb(tablename: string) {
    await db.$queryRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
}

export async function createTestImage(
    app: Server,
    cookies: string[],
    variables: any = {},
) {
    const signedUrlResponse = await request(app)
        .post("/graphql")
        .set("Cookie", cookies)
        .send({
            query: `
        query GetSignedUrl {
          imageUploadUrls(fileExtensions: ["jpeg"]) {
            signedUrl
            key
          }
        }
      `,
        });
    assert.equal(signedUrlResponse.status, 200);
    const [{signedUrl, key}] = signedUrlResponse.body.data.imageUploadUrls;
    assert.exists(signedUrl);
    const file = fs.readFileSync(__dirname + "/assets/test-image.jpeg");
    const s3UploadResponse = await axios.put(signedUrl, file);
    assert.equal(s3UploadResponse.status, 200);
    const uploadImageResponse = await request(app)
        .post("/graphql")
        .set("Cookie", cookies)
        .send({
            query: `
        mutation UploadImage($input: UploadImageInput!) {
          images {
            uploadImage(input: $input) {
              id
              hash
              url
              title
              ownership {
                owner { id }
                uploader { id }
              }
              price {
                amount
                currency
                discount
              }
              forSale
              public
            }
          }
        }
      `,
            variables: {
                input: {
                    url: key,
                    forSale: false,
                    public: false,
                    title: "test image 1",
                    ...variables,
                },
            },
        });
    assert.equal(uploadImageResponse.status, 200);
    const responseData = uploadImageResponse.body.data.images.uploadImage;
    assert.exists(responseData.url);
    assert.equal(responseData.title, variables.title ?? "test image 1");
    assert.equal(responseData.forSale, variables.forSale ?? false);
    assert.equal(responseData.public, variables.public ?? false);
    assert.deepEqual(responseData.price, variables.price ?? null);
    assert.exists(responseData.ownership.owner.id);
    assert.exists(responseData.ownership.uploader.id);
    return responseData;
}
