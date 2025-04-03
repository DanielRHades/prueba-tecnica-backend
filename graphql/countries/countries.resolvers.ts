import { Context } from '../context';

export const countryResolvers = {
    Query: {
        countries: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "User") {
                return ctx.prisma.country.findMany({
                    where: { id: { in: ctx.user.Country.map(c => c.id) } },
                });
            }

            return ctx.prisma.country.findMany();
        },
    },

    Country: {
        users: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.country
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    },
};
