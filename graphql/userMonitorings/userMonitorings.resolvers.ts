import { Context } from '@/graphql/context';
import { UserMonitoringArguments } from '@/graphql/userMonitorings/userMonitorings.types';
import { requireRole } from '@/graphql/utils/errors';

export const userMonitoringResolvers = {
  Query: {
    /* Query que devuelve todos los UserMonitorings. Este query devuelve información sólo para
        usuarios Admin. */
    userMonitorings: async (
      _parent: any,
      args: UserMonitoringArguments,
      ctx: Context
    ) => {
      requireRole(ctx, ['Admin']);
      const { cursorById, take = 10, skip = 1 } = args;

      return ctx.prisma.userMonitoring.findMany({
        take,
        skip,
        ...(cursorById && {
          cursor: {
            id: cursorById
          }
        }),
        orderBy: {
          id: 'asc'
        }
      });
    },

    /* Query que devuelve todos los UserMonitoring de un user en un rango de tiempo, pasando como parámetros:
            - El correo del usuario
            - Fecha inicial del rango de búsqueda
            - Fecha final del rango de búsqueda */
    userMonitoringsByEmailAndDate: async (
      _parent: any,
      args: UserMonitoringArguments,
      ctx: Context
    ) => {
      requireRole(ctx, ['Admin']);
      const user = await ctx.prisma.user.findUnique({
        where: { email: args.email }
      });

      if (!user) {
        throw new Error('El usuario con ese correo no existe.');
      }

      const { cursorById, take = 10, skip = 1 } = args;

      return ctx.prisma.userMonitoring.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(args.startingDate),
            lte: new Date(args.endDate)
          }
        },
        take,
        skip,
        ...(cursorById && {
          cursor: {
            id: cursorById
          }
        }),
        orderBy: {
          id: 'asc'
        }
      });
    }
  },

  UserMonitoring: {
    user: async (parent: any, _args: any, ctx: Context) => {
      requireRole(ctx, ['Admin']);
      return ctx.prisma.user.findUnique({ where: { id: parent.userId } });
    }
  }
};
