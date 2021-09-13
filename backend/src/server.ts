import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { readFile as originalReadFile } from 'fs';
import { resolvers } from './resolvers';
import http from 'http';
import express from 'express';
import { promisify } from 'util';
import cookieSession from 'cookie-session';
import { GraphQLLocalStrategy, buildContext } from "graphql-passport";
import passport from 'passport';
import { db } from './db';
import { AthenticationError } from './types/exceptions';
import { User } from '.prisma/client';
const readFile = promisify(originalReadFile);

passport.use(
  new GraphQLLocalStrategy({passReqToCallback:true},async (_req, username, password, done) => {
    const user = await db.user.findFirst({ where: { username, password } });
    if(!user) done(new AthenticationError(403, 'Invalid username or password'), null);
    else done(null, user);
  })
);

passport.serializeUser(function(user, done) {
  done(null, (user as User).id);
});

passport.deserializeUser(async function(id:string, done) {
  const user = await db.user.findUnique({where:{id}});
  if(!user) done(new AthenticationError(403, 'Invalid username or password'), null);
  else done(null, user);
});

async function main() {
  const typeDefs = await readFile('./src/schema.graphql', 'utf-8');
  const app = express();
  const httpServer = http.createServer(app);
  app.use(cookieSession({ secret: process.env.SESSION_SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res}) => buildContext({ req, res }),
    formatError: (err) => {
      console.error(JSON.stringify(err, null, process.env.NODE_ENV === 'production' ? undefined : 2));
      return err;
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve as () => void));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return httpServer;
}

export const httpServerPromise = main();
