import { PrismaClient, User, Role } from "@prisma/client";
import { NextApiRequest } from "next";
import { prisma } from "../lib/prisma";

export type Context = {
    prisma: PrismaClient;
    user: User & {
        Role?: Role | null;
        Country: { id: string }[];
    };
};

export async function getUserFromToken(req: NextApiRequest) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) throw new Error("Acceso denegado: Token requerida.");

    const session = await prisma.session.findUnique({
        where: { sessionToken: token },
        include: { User: { include: { Role: true, Country: true } } },
    });

    if (!session || !session.User) throw new Error("Acceso denegado: Token inválida.");

    return session.User;
}

export async function createContext(req: NextApiRequest): Promise<Context> {
    const user = await getUserFromToken(req);
    return { prisma, user };
}
