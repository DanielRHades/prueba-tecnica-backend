import { NextApiRequest } from 'next';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function getUserFromToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) throw new Error('Acceso denegado: Token requerida.');

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (err) {
    throw new Error('Token inválida o expirada.');
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { User: { include: { Role: true, Country: true } } }
  });

  if (!session || !session.User)
    throw new Error('Acceso denegado: Sesión no válida.');

  if (session.User.email !== decoded.Email) {
    throw new Error(
      'Acceso denegado: El correo del token no coincide con el del usuario.'
    );
  }

  return session.User;
}
