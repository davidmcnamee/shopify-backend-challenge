/** @format */

import {ApolloServer} from "apollo-server-express";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import {readFile as originalReadFile} from "fs";
import {resolvers} from "./resolvers";
import http from "http";
import express from "express";
import {promisify} from "util";
import cookieSession from "cookie-session";
import {GraphQLLocalStrategy, buildContext} from "graphql-passport";
import passport from "passport";
import {db} from "./db";
import {createError} from "./types/external-errors";
import {User} from ".prisma/client";
import bcrypt from "bcryptjs";
import cors from "cors";
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
    console.log("serializing ", user, (user as User).id);
    done(null, (user as User).id);
});

passport.deserializeUser(async function (id: string, done) {
    const user = await db.user.findUnique({where: {id}});
    console.log("deserializing ", id, user);
    if (!user) done(null, null);
    else done(null, user);
});

async function main() {
    const typeDefs = await readFile("./src/schema.graphql", "utf-8");
    const app = express();
    app.use(
        cors({
            origin: process.env.FRONTEND_ORIGIN,
            credentials: true,
            methods: ["GET", "POST"],
        }),
    );
    const httpServer = http.createServer(app);
    app.get("/", (req, res) => res.sendStatus(200)); // healthcheck
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
