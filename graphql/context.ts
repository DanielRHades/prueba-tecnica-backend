import { PrismaClient, User, Role } from '@prisma/client';
import { NextApiRequest } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export type Context = {
  db: PrismaClient;
  session: User & {
    Role?: Role | null;
    Country: { id: string }[];
  };
};

export const createContext = async (req: NextApiRequest): Promise<Context> => {
  const session = await getUserFromToken(req);
  const db = prisma;
  return { db, session };
};
