import { Context } from '@/graphql/context';
import { requireRole } from '@/graphql/utils/errors';
import { CountryArguments } from '@/graphql/countries/countries.types';
import { Country } from '@prisma/client';

export const countryResolvers = {
  Query: {
    /* Query que devuelve todos los Countries. Este query devuelve información sólo para
        usuarios Admin o Manager. */
    countries: async (args: CountryArguments, { db, session }: Context) => {
      requireRole(session, ['Admin', 'Manager']);
      const { cursorById, take = 10, skip = 0 } = args;

      const countries = await db.$queryRaw<any[]>`
            SELECT * FROM "Country"
            WHERE (${cursorById}::text IS NULL OR "id" > ${cursorById}::text)
            ORDER BY "id" ASC
            LIMIT ${take} OFFSET ${skip}
            `;

      return countries;
    }
  },

  Country: {
    users: async (parent: Country, { db, session }: Context) => {
      requireRole(session, ['Admin', 'Manager']);
      return db.country.findUnique({ where: { id: parent.id } }).User();
    }
  }
};
