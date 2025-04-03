import { Context } from '../context';

export const userMonitoringResolvers = {
    Query: {
        userMonitorings: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new Error("Acceso denegado: El token no posee la información requerida.");

            if (ctx.user.Role?.name === "User") {
                return ctx.prisma.userMonitoring.findMany({
                    where: { userId: ctx.user.id },
                });
            }

            if (ctx.user.Role?.name === "Manager") {
                throw new Error("Acceso denegado: No tienes el rol necesario para esta query.");
            }

            return ctx.prisma.userMonitoring.findMany();
        },
    },
};