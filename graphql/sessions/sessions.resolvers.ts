import { Context } from '@/graphql/context';
import { requireRole } from '@/graphql/utils/errors';
import { SessionArguments } from '@/graphql/sessions/sessions.types';
import { Session } from '@prisma/client';

export const sessionResolvers = {
  Query: {
    /* Query que devuelve todos los Sessions. Este query devuelve información sólo para
        usuarios Admin. */
    sessions: async (args: SessionArguments, ctx: Context) => {
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
    user: async (parent: Session, ctx: Context) => {
      requireRole(ctx, ['Admin']);
      return ctx.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    }
  }
};
