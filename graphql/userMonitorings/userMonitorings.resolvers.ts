import { Context } from '../context';
import { UserMonitoringArguments } from './userMonitorings.types';
import { requireRole} from '../utils/errors';

export const userMonitoringResolvers = {
    Query: {
        userMonitorings: async (_parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin']);
            return ctx.prisma.userMonitoring.findMany();
        },

        userMonitoringsByEmailAndDate: async (_parent: any, args: UserMonitoringArguments, ctx: Context) => {
            requireRole(ctx, ['Admin']);

            const user = await ctx.prisma.user.findUnique({
                where: { email: args.email },
            });

            if (!user) {
                throw new Error("El usuario con ese correo no existe.");
            }

            return ctx.prisma.userMonitoring.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: new Date(args.startingDate),
                        lte: new Date(args.endDate),
                    },
                },
            });
        },
    },

    UserMonitoring: {
        user: async (parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin']);
            return ctx.prisma.user.findUnique({ where: { id: parent.userId } });
        },
    },
};
