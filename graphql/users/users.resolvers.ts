import { Context } from '../context';
import { TopMonitoringArguments, TopMonitoringDescriptionAndCountryArguments, UserArguments } from './users.types';
import { requireRole, createNotFoundError } from '../utils/errors';

export const userResolvers = {
    Query: {
        users: async (_parent: any, _args: any, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);
            return ctx.prisma.user.findMany();
        },

        userByEmail: async (_parent: any, args: UserArguments, ctx: Context) => {
            const user = requireRole(ctx, ['Admin', 'Manager', 'User']);
            
            if (user.Role?.name === 'User' && user.email !== args.email) {
                throw createNotFoundError("No tienes permiso para ver este usuario.");
            }
            
            const result = await ctx.prisma.user.findUnique({
                where: { email: args.email },
            });
            
            if (!result) {
                throw createNotFoundError("Usuario no encontrado");
            }
            
            return result;
        },

        userById: async (_parent: any, args: UserArguments, ctx: Context) => {
            const user = requireRole(ctx, ['Admin', 'Manager', 'User']);
            
            if (user.Role?.name === 'User' && user.id !== args.id) {
                throw createNotFoundError("No tienes permiso para ver este usuario.");
            }
            
            const result = await ctx.prisma.user.findUnique({
                where: { id: args.id },
            });
            
            if (!result) {
                throw createNotFoundError("Usuario no encontrado");
            }
            
            return result;
        },

        topThreeUsersByMonitoring: async (_parent: any, args: TopMonitoringArguments, ctx: Context) => {
            requireRole(ctx, ['Admin']);

            const topUsers = await ctx.prisma.userMonitoring.groupBy({
                by: ['userId'],
                _count: { userId: true },
                where: {
                    createdAt: {
                        gte: new Date(args.startingDate),
                        lte: new Date(args.endDate),
                    },
                },
                orderBy: { _count: { userId: 'desc' } },
                take: 3,
            });

            if (!topUsers.length) return [];

            const userIds = topUsers.map(u => u.userId);

            return ctx.prisma.user.findMany({
                where: { id: { in: userIds } }
            });
        },

        topThreeUsersByMonitoringDescriptionAndCountry: async (
            _parent: any,
            args: TopMonitoringDescriptionAndCountryArguments,
            ctx: Context
        ) => {
            requireRole(ctx, ['Admin']);

            const topUsers = await ctx.prisma.userMonitoring.groupBy({
                by: ['userId'],
                _count: { userId: true },
                where: {
                    description: args.description,
                    createdAt: {
                        gte: new Date(args.startingDate),
                        lte: new Date(args.endDate),
                    },
                    User: {
                        Country: {
                            some: { id: args.countryId },
                        },
                    },
                },
                orderBy: { _count: { userId: 'desc' } },
                take: 3,
            });

            if (!topUsers.length) return [];

            const userIds = topUsers.map(u => u.userId);

            return ctx.prisma.user.findMany({
                where: { id: { in: userIds } }
            });
        },
    },

    User: {
        role: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.role.findUnique({ where: { id: parent.roleId } });
        },
        sessions: async (parent: any, _args: any, ctx: Context) => {
            if (ctx.user.Role?.name === "Manager" && ctx.user.id != parent.id) {
                return [];
            }
            return ctx.prisma.session.findMany({ where: { userId: parent.id } });
        },
        countries: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.user
                .findUnique({ where: { id: parent.id } })
                .Country();
        },
        userMonitorings: async (parent: any, _args: any, ctx: Context) => {
            if (ctx.user.Role?.name === "Manager" && ctx.user.id != parent.id) {
                return [];
            }
            return ctx.prisma.userMonitoring.findMany({ where: { userId: parent.id } });
        },
    },
};