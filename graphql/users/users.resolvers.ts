import { Context } from '../context';

export const userResolvers = {
    Query: {
        users: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "Admin") {
                return ctx.prisma.user.findMany();
            }

            if (ctx.user.Role?.name === "Manager") {
                return ctx.prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: true,
                        roleId: true,
                        Role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        Country: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
            });

            return user ? [user] : [];
        },

        userByEmail: async (_parent: any, args: { email: string }, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "User" && ctx.user.email !== args.email) {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }

            return ctx.prisma.user.findUnique({
                where: { email: args.email },
            });
        },

        userById: async (_parent: any, args: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");


            if (ctx.user.Role?.name === "User" && ctx.user.id !== args.id) {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }

            return ctx.prisma.user.findUnique({
                where: { id: args.id },
            });
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
            if (ctx.user.Role?.name === "Manager" && ctx.user.id !== parent.id) {
                return [];
            }
            return ctx.prisma.userMonitoring.findMany({ where: { userId: parent.id } });
        },
    },
};