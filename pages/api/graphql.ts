import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, Context } from '@/graphql/context';
import depthLimit from 'graphql-depth-limit';
import { formatGraphQLError } from '@/graphql/utils/errorFormatter';

const apolloServer = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(3)],
  formatError: formatGraphQLError
});

export default startServerAndCreateNextHandler(apolloServer, {
  context: async (req) => createContext(req)
});
