import { Context } from '../context';

export const countryResolvers = {
    Query: {
        countries: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida del usuario.");

            if (ctx.user.Role?.name === "User") {
                throw new Error("Acceso denegado: No tienes permiso para acceder a los countries.");
            }

            return ctx.prisma.country.findMany();
        },
    },

    Country: {
        users: async (parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) {
                throw new Error("Acceso denegado: El token no posee la información requerida del usuario.");
            }

            if (ctx.user.Role?.name === 'User') {
                throw new Error('Acceso denegado: No tienes permiso para ver los usuarios de este país.');
            }

            return ctx.prisma.country
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    },
};

