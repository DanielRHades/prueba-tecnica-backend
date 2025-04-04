import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { createContext, Context } from '../../graphql/context';
import depthLimit from 'graphql-depth-limit';
import { GraphQLError } from 'graphql';
import { AppError, ErrorType } from '@/graphql/utils/errors';

const apolloServer = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(3)],
    formatError: (err) => {
        if (err.message.includes("exceeds maximum operation depth")) {
            return new GraphQLError(
                "Profundidad máxima permitida: 3. Reduce la complejidad de la consulta.",
                { 
                    extensions: {
                        type: ErrorType.VALIDATION,
                        code: 'DEPTH_LIMIT_EXCEEDED'
                    }
                }
            );
        }

        if (err instanceof AppError) {
            return err;
        }

        return new GraphQLError(
            err.message || "Ha ocurrido un error interno",
            {
                extensions: {
                    type: ErrorType.INTERNAL,
                    code: 'INTERNAL_SERVER_ERROR',
                    originalError: process.env.NODE_ENV === 'development' ? err : undefined
                }
            }
        );
    },
});

export default startServerAndCreateNextHandler(apolloServer, {
    context: async (req, res) => createContext(req),
});

