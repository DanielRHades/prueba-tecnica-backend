import { Context } from '../context';
import { requireRole } from '../utils/errors';

export const roleResolvers = {
    Query: {
        roles: async (_parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            return ctx.prisma.role.findMany();
        },
    },
    Role: {
        users: async (parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            return ctx.prisma.role
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    }
};


