import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function loginUserWithCredentials(email: string, password: string) {
    if (!email || !password) {
        throw new Error("Email y contraseña son requeridos");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { Role: true }
    }) as (User & { Role: Role | null }) | null;

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    if (!user.password) {
        throw new Error("Usuario no tiene contraseña configurada");
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        throw new Error("Contraseña incorrecta");
    }

    const tokenPayload = {
        iss: "Prevalentware",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 días
        aud: "www.prevalentware.com",
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
            expiresAt,
        }
    });

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        sessionToken
    };
}
