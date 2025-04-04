import { Context } from '../context';
import { requireRole } from '../utils/errors';

export const sessionResolvers = {
    Query: {
        sessions: async (_parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin']);
            return ctx.prisma.session.findMany();
        },
    },
    Session: {
        user: async (parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin']);
            return ctx.prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
    },
};
