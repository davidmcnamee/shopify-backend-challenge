/** @format */

import request from "supertest";
import {assert} from "chai";
import {httpServerPromise} from "../src/server";
import {Server} from "http";
import {clearDb, createTestImage, createTestUser} from "./util";

let app: Server = null!;

before(async () => {
    app = await httpServerPromise;
});

beforeEach(async () => {
    await clearDb("Image");
});

describe("image", function () {
    this.timeout(5000);
    describe("purchaseImage()", function () {
        it("should work normally", async () => {
            const {user, userResponse} = await createTestUser(app);
            const cookies = userResponse.headers["set-cookie"];
            const image = await createTestImage(app, cookies, {
                forSale: true,
                price: {amount: 5534, currency: "CAD", discount: 0},
            });
            const response = await request(app)
                .post("/graphql")
                .set("Cookie", cookies)
                .send({
                    query: `mutation PurchaseImage($input: PurchaseImageInput!) {
            images {
              purchaseImage(input: $input) {
                id
                forSale
                ownership {
                  owner {
                    id
                  }
                }
              }
            }
          }`,
                    variables: {input: {imageID: image.id, price: 5534}},
                });
            assert.equal(response.statusCode, 200);
            const purchasedImage = response.body.data.images.purchaseImage;
            assert.equal(purchasedImage.forSale, false);
            assert.equal(purchasedImage.ownership.owner.id, user.id);
        });
    });
    describe("updateImage()", function () {
        it("should work normally", () => {});
    });
    describe("uploadImage()", function () {
        it("should work normally", async function () {
            const {userResponse} = await createTestUser(app);
            const cookies = userResponse.headers["set-cookie"];
            await createTestImage(app, cookies);
        });
    });
    describe("uploadImages()", function () {
        it("should work normally", () => {});
    });
    describe("uploadImagesFromFile()", function () {
        this.timeout(10 * 60 * 1000); // 10 minutes
        it("should work normally", async () => {
            const {userResponse} = await createTestUser(app);
            const cookies = userResponse.headers["set-cookie"];
            const jobResponse = await request(app)
                .post("/graphql")
                .set("Cookie", cookies)
                .send({
                    query: `
                        mutation UploadImagesFromFile {
                            images{
                                uploadImagesFromFile(url: "https://storage.googleapis.com/shopifychallengedata/test-bulk-upload.csv")
                            }
                        }
                    `,
                });
            console.log("received response");
            assert.equal(5, 6); // to show console.logs
        });
    });
});

after(async () => app.close());
