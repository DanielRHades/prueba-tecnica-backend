import { GraphQLError } from 'graphql';
import { Context } from '@/graphql/context';

export enum ErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  INTERNAL = 'INTERNAL'
}

export class AppError extends GraphQLError {
  constructor(
    message: string,
    type: ErrorType,
    code?: string,
    extensions?: Record<string, any>
  ) {
    super(message, {
      extensions: {
        type,
        code,
        ...extensions
      }
    });
  }
}

export const createUnauthorizedError = (
  message: string = 'Acceso denegado: El token no posee la información requerida del usuario.'
) => {
  return new AppError(message, ErrorType.UNAUTHORIZED, 'UNAUTHORIZED');
};

export const createForbiddenError = (
  message: string = 'Acceso denegado: No tienes el rol necesario para esta operación.'
) => {
  return new AppError(message, ErrorType.FORBIDDEN, 'FORBIDDEN');
};

export const createNotFoundError = (
  message: string = 'Recurso no encontrado.'
) => {
  return new AppError(message, ErrorType.NOT_FOUND, 'NOT_FOUND');
};

export const requireAuth = (ctx: Context) => {
  if (!ctx.user) {
    throw createUnauthorizedError();
  }
  return ctx.user;
};

export const requireRole = (ctx: Context, allowedRoles: string[]) => {
  const user = requireAuth(ctx);

  if (!user.Role || !allowedRoles.includes(user.Role.name)) {
    throw createForbiddenError(
      `Acceso denegado: Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
    );
  }

  return user;
};
