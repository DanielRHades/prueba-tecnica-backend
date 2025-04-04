import { Context } from '../context';

export const roleResolvers = {
    Query: {
        roles: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name !== "Admin") {
                throw new Error("Acceso denegado: Debes der Admin para acceder a esta query.");
            }

            return ctx.prisma.role.findMany();
        },
    },
    Role: {
        users: async (parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) {
                throw new Error("Acceso denegado: El token no posee la información requerida.");
            }

            if (ctx.user.Role?.name !== 'Admin') {
                throw new Error("Acceso denegado: Solo los administradores pueden acceder a esta información.");
            }

            return ctx.prisma.role
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    }
};


