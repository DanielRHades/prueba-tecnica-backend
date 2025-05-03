import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ErrorType } from '@/graphql/utils/errors';
import { AppError } from '@/graphql/utils/errors';

export function formatGraphQLError(err: GraphQLFormattedError): GraphQLFormattedError {
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
}