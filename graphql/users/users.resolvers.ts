import { Context } from '../context';
import { TopMonitoringArguments, UserArguments } from './users.types';

export const userResolvers = {
    Query: {
        users: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "Admin") {
                return ctx.prisma.user.findMany();
            }

            if (ctx.user.Role?.name === "Manager") {
                return ctx.prisma.user.findMany();
            }

            {/*Si el usuario tiene el rol de User en la Token, 
            se retorna unicamente su información propia.*/ }
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
            });

            return user ? [user] : [];
        },

        userByEmail: async (_parent: any, args: UserArguments, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "User" && ctx.user.email !== args.email) {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }

            return ctx.prisma.user.findUnique({
                where: { email: args.email },
            });
        },

        userById: async (_parent: any, args: UserArguments, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "User" && ctx.user.id !== args.id) {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }

            return ctx.prisma.user.findUnique({
                where: { id: args.id },
            });
        },

        topThreeUsersByMonitoring: async (_parent: any, args: TopMonitoringArguments, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: No hay información del usuario.");

            if (ctx.user.Role?.name !== 'Admin') {
                throw new Error("Acceso denegado: Solo los administradores pueden acceder a esta información.");
            }

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
    },

    User: {
        role: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.role.findUnique({ where: { id: parent.roleId } });
        },
        sessions: async (parent: any, _args: any, ctx: Context) => {
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