import { Context } from '@/graphql/context';
import { requireRole } from '@/graphql/utils/errors';
import { CountryArguments } from '@/graphql/countries/countries.types';

export const countryResolvers = {
  Query: {
    /* Query que devuelve todos los Countries. Este query devuelve información sólo para
        usuarios Admin o Manager. */
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
    }
  },

  Country: {
    users: async (parent: any, _args: any, ctx: Context) => {
      requireRole(ctx, ['Admin', 'Manager']);
      return ctx.prisma.country.findUnique({ where: { id: parent.id } }).User();
    }
  }
};
