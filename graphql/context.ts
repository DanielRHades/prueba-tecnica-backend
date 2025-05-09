import { PrismaClient, User, Role } from '@prisma/client';
import { NextApiRequest } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export type Context = {
  prisma: PrismaClient;
  user: User & {
    Role?: Role | null;
    Country: { id: string }[];
  };
};

export async function createContext(req: NextApiRequest): Promise<Context> {
  const user = await getUserFromToken(req);
  return { prisma, user };
}
