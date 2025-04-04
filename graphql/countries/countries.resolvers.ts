import { Context } from '../context';
import { requireRole } from '../utils/errors';
import { CountryArguments } from './countries.types';

export const countryResolvers = {
    Query: {
        countries: async (_parent: any, args: CountryArguments, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            const { cursorById, take = 10, skip = 0 } = args;

            const countries = await ctx.prisma.$queryRaw<any[]>`
            SELECT * FROM "Country"
            WHERE (${cursorById}::text IS NULL OR "id" > ${cursorById}::text)
            ORDER BY "id" ASC
            LIMIT ${take} OFFSET ${skip}
            `;

            return countries;
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

