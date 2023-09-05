import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import cors from 'cors';
import { json } from 'body-parser';
import express from 'express';
import http from 'http';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from "@graphql-tools/schema"
import * as dotenv from 'dotenv';
import { getSession } from "next-auth/react";
import { GraphQLContext, Session, SubscriptionContext } from './util/types';
import { PrismaClient } from "@prisma/client"
import { PubSub } from 'graphql-subscriptions';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

async function main() {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql/subscriptions',
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Context Parameters
  const prisma = new PrismaClient();
  const pubsub = new PubSub();


  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema, context: async (
    ctx: SubscriptionContext
  ): Promise<GraphQLContext> => {
    if (ctx.connectionParams && ctx.connectionParams.session) {
      const { session } = ctx.connectionParams;
      return { session, prisma, pubsub }
    }

    return { session: null, prisma, pubsub}
  } }, wsServer);

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    // cache: 'bounded',
    // context: async ({ req, res }): Promise<GraphQLContext> => {
    //   const session = await getSession({ req }) as Session;
    //   return { session, prisma, pubsub };
    // },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  // server.applyMiddleware({ app, cors: corsOptions });

  const corsOptions = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  }

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const session = await getSession({ req });

        return { session: session as Session, prisma, pubsub}
      }
    }),
  );
  const PORT = 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

main().catch(error => console.log(error));