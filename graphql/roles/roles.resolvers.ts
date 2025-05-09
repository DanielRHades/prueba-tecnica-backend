import { Context } from '@/graphql/context';
import { requireRole } from '@/graphql/utils/errors';
import { RoleArguments } from '@/graphql/roles/roles.types';

export const roleResolvers = {
  Query: {
    /* Query que devuelve todos los Roles. Este query devuelve información sólo para
        usuarios Admin o Manager. */
    roles: async (_parent: any, args: RoleArguments, ctx: Context) => {
      requireRole(ctx, ['Admin', 'Manager']);
      const { cursorById, take = 10, skip = 1 } = args;

      return ctx.prisma.role.findMany({
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
  Role: {
    users: async (parent: any, _args: any, ctx: Context) => {
      requireRole(ctx, ['Admin', 'Manager']);
      return ctx.prisma.role.findUnique({ where: { id: parent.id } }).User();
    }
  }
};
