import { Context } from '@/graphql/context';
import { requireRole } from '@/graphql/utils/errors';
import { SessionArguments } from '@/graphql/sessions/sessions.types';

export const sessionResolvers = {
  Query: {
    /* Query que devuelve todos los Sessions. Este query devuelve información sólo para
        usuarios Admin. */
    sessions: async (_parent: any, args: SessionArguments, ctx: Context) => {
      requireRole(ctx, ['Admin']);
      const { cursorById, take = 10, skip = 1 } = args;

      return ctx.prisma.session.findMany({
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
  Session: {
    user: async (parent: any, _args: any, ctx: Context) => {
      requireRole(ctx, ['Admin']);
      return ctx.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    }
  }
};
