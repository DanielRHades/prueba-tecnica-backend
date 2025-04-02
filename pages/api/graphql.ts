import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { Context } from '../../graphql/context';
import { prisma } from '../../lib/prisma';
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";

const apolloServer = new ApolloServer<Context>({ typeDefs, resolvers });

export default startServerAndCreateNextHandler(apolloServer, {
    context: async (req, res) => ({ req, res, prisma }),
});