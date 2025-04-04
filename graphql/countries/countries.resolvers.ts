import { Context } from '../context';
import { requireRole} from '../utils/errors';

export const countryResolvers = {
    Query: {
        countries: async (_parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            return ctx.prisma.country.findMany();
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

