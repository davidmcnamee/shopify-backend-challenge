/** @format */

import {assert} from "chai";
import {httpServerPromise} from "../src/server";
import request from "supertest";
import {Server} from "http";
import {clearDb, createTestUser} from "./util";

let app: Server | null = null;
before(async () => (app = await httpServerPromise));
beforeEach(() => clearDb("User"));

describe("users", function () {
    this.timeout(5000);
    describe("register()", function () {
        it("should create a user when run normally", () => createTestUser(app));
        it("should fail when the provided email already exists", async () => {
            await createTestUser(app);
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
                            email: "david2@email.com",
                            password: "password2",
                        },
                    },
                });
            assert.equal(
                response.body.errors[0].extensions.code,
                "DUPLICATE_USERNAME",
            );
        });
    });
    describe("login()", function () {
        this.timeout(10000);
        it("should work normally", async function () {
            await createTestUser(app);
            const response = await request(app)
                .post("/graphql")
                .send({
                    query: `
            mutation UserLogin($input: LoginInput!) {
              users {
                login(input: $input) {
                  id
                  username
                  email
                }
              }
            }        
          `,
                    variables: {
                        input: {username: "david", password: "password"},
                    },
                });
            assert.equal(response.status, 200);
            assert.equal(response.body.data.users.login.username, "david");
            assert.equal(response.body.data.users.login.email, "david@email.com");
        });
    });
});

after(async () => app.close());
