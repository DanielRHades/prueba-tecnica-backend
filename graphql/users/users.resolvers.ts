import { Context } from '../context';
import { CreateUserArguments, TopMonitoringArguments, TopMonitoringDescriptionAndCountryArguments, UserArguments } from './users.types';
import { requireRole, createNotFoundError } from '../utils/errors';
import { loginUserWithCredentials } from '@/services/auth.service';
import { hash } from 'bcryptjs';


export const userResolvers = {
    Query: {
        /* Query que devuelve todos los Users. Este query devuelve información sólo para
        usuarios Admin o Manager. */
        users: async (_parent: any, args: UserArguments, ctx: Context) => {
            requireRole(ctx, ['Admin', 'Manager']);

            const { cursorById, take = 10, skip = 1 } = args;

            return ctx.prisma.user.findMany({
                take,
                skip,
                ...(cursorById && {
                    cursor: {
                        id: cursorById,
                    },
                }),
                orderBy: {
                    id: 'asc',
                },
            });
        },

        /* Query que devuelve un User por su email. Este query devuelve información para
        usuarios Admin, Manager o User si el email es del usuario que está autenticado. */
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

        /* Query que devuelve un User por su id. Este query devuelve información para
        usuarios Admin, Manager o User si el id es del usuario que está autenticado. */
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

        /* Query que devuelve los 3 usuarios con más monitoreos en un rango de tiempo, pasando como parámetros:
            - Fecha inicial del rango de búsqueda
            - Fecha final del rango de búsqueda */
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

        /* Query que devuelve los 3 usuarios con más monitoreos en un rango de tiempo, pasando como parámetros:
            - La descripción del monitoreo
            - Fecha inicial del rango de búsqueda
            - Fecha final del rango de búsqueda
            - El id del país */
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

    Mutation: {
        createUser: async (_parent: any, args: CreateUserArguments, ctx: Context) => {
            const hashPassword = await hash(args.password, 10);
            return ctx.prisma.user.create({
                data: {
                    name: args.name,
                    email: args.email,
                    password: hashPassword,
                    updatedAt: new Date(),
                    roleId: args.roleId,
                }
            })
        },
        login: async (_: any, { email, password }: { email: string; password: string }) => {
            return await loginUserWithCredentials(email, password);
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