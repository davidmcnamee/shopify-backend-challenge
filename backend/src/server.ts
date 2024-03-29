/** @format */

import {User} from ".prisma/client";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import {ApolloServer} from "apollo-server-express";
import bcrypt from "bcryptjs";
import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";
import {readFile as originalReadFile} from "fs";
import {buildContext, GraphQLLocalStrategy} from "graphql-passport";
import http from "http";
import passport from "passport";
import {promisify} from "util";
import {db} from "./db";
import {resolvers} from "./resolvers";
import {createError} from "./types/external-errors";
import {stripeWebhookHandler} from "./webhook";
import bodyParser from "body-parser";
const readFile = promisify(originalReadFile);

passport.use(
    new GraphQLLocalStrategy(
        {passReqToCallback: true},
        async (_req, username: string, password: string, done) => {
            const user = await db.user.findFirst({where: {username}});
            if (!user) done(createError("USER_NOT_FOUND"), null);
            else if (!(await bcrypt.compare(password, user.password)))
                done(createError("INVALID_LOGIN"), null);
            else done(null, user);
        },
    ),
);

passport.serializeUser(function (user, done) {
    done(null, (user as User).id);
});

passport.deserializeUser(async function (id: string, done) {
    const user = await db.user.findUnique({where: {id}});
    if (!user) done(null, null);
    else done(null, user);
});

async function main() {
    const typeDefs = await readFile("./src/schema.graphql", "utf-8");
    const app = express();
    console.log('cors set up for: ', process.env.FRONTEND_ORIGIN);
    app.use(
        cors({
            origin: process.env.FRONTEND_ORIGIN,
            credentials: true,
            methods: ["GET", "POST"],
        }),
    );
    const httpServer = http.createServer(app);
    app.get("/", (req, res) => res.sendStatus(200)); // healthcheck
    app.post(
        "/stripe/webhook",
        bodyParser.raw({type: "application/json"}),
        stripeWebhookHandler,
    );
    app.use(cookieSession({secret: process.env.SESSION_SECRET}));
    app.use(passport.initialize());
    app.use(passport.session());
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({req, res}) => buildContext({req, res}),
        formatError: err => {
            console.error(JSON.stringify(err));
            return err;
        },
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            ApolloServerPluginLandingPageGraphQLPlayground({}),
        ],
    });
    await server.start();
    server.applyMiddleware({app, path: "/graphql", cors: false});

    await new Promise(resolve =>
        httpServer.listen({port: 4000}, resolve as () => void),
    );
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    return httpServer;
}

export const httpServerPromise = main();
