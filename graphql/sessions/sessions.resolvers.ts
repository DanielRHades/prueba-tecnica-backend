import { Context } from '../context';

export const sessionResolvers = {
    Query: {
        sessions: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user || ctx.user.Role?.name !== "Admin") {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }
            return ctx.prisma.session.findMany();
        },
    },
};