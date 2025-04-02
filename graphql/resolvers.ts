import { Context } from './context';

export const resolvers = {
    Query: {
        users: async (_parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.user.findMany();
        },
        countries: async (_parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.country.findMany();
        },
        roles: async (_parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.role.findMany();
        },
        sessions: async (_parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.session.findMany();
        },
        userMonitorings: async (_parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.userMonitoring.findMany();
        },
    },

    User: {
        role: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.role.findUnique({ where: { id: parent.roleId } });
        },
        session: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.session.findMany({ where: { userId: parent.id } });
        },
        countries: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.user
                .findUnique({ where: { id: parent.id } })
                .Country();
        },
        userMonitorings: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.userMonitoring.findMany({ where: { userId: parent.id } });
        },
    },

    Country: {
        users: async (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.country
                .findUnique({ where: { id: parent.id } })
                .User();
        },
    },
};
