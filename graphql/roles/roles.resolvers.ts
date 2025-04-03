import { Context } from '../context';

export const roleResolvers = {
    Query: {
        roles: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");
            return ctx.prisma.role.findMany();
        },
    },
};


