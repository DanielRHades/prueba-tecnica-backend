import { Context } from '../context';

export const sessionResolvers = {
    Query: {
        sessions: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name !== "Admin") {
                throw new Error("Acceso denegado: Debes der Admin para acceder a esta query.");
            }

            return ctx.prisma.session.findMany();
        },
    },
    Session: {
        user: async (parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) {
                throw new Error("Acceso denegado: El token no posee la información requerida.");
            }

            if (ctx.user.Role?.name !== 'Admin') {
                throw new Error("Acceso denegado: Solo los administradores pueden acceder a esta información.");
            }
            return ctx.prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
    },
};
