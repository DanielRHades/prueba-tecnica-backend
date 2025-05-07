import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const loginUserWithCredentials = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { Role: true, Country: true }
  });

  if (!user || !user.password) {
    throw new Error('Credenciales inválidas');
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    throw new Error('Credenciales inválidas');
  }

  const tokenPayload = {
    iss: 'Prevalentware',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, //30 DIAS
    aud: 'www.prevalentware.com',
    sub: user.email,
    GivenName: user.name?.split(' ')[0] || '',
    Surname: user.name?.split(' ').slice(1).join(' ') || '',
    Email: user.email,
    Role: user.Role?.id || ''
  };

  const sessionToken = jwt.sign(tokenPayload, JWT_SECRET);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.session.create({
    data: {
      id: Math.random().toString(36).substring(2),
      sessionToken,
      userId: user.id,
      expiresAt
    }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    sessionToken
  };
};
