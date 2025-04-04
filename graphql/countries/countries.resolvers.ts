import { Context } from '../context';
import { requireRole} from '../utils/errors';
import { CountryArguments } from './countries.types';

export const countryResolvers = {
    Query: {
        countries: async (_parent: any, args: CountryArguments, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            const { cursorById, take = 10, skip = 1 } = args;
            
            return ctx.prisma.country.findMany({
                take,
                skip,
                ...(cursorById && {
                    cursor: {
                        id: cursorById,
                    },
                }),
                orderBy: {
                    id: 'asc',
                },
            });
        },
    },

    Country: {
        users: async (parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            return ctx.prisma.country
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    },
};

