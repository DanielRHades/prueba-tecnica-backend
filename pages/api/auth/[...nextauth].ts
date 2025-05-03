import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth from "next-auth/next";
import { User, Role } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email y contraseña son requeridos");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                    include: {
                        Role: true
                    }
                }) as (User & { Role: Role | null }) | null;

                if (!user) {
                    throw new Error("Usuario no encontrado");
                }

                if (!user.password) {
                    throw new Error("Usuario no tiene contraseña configurada");
                }

                const isValid = await compare(credentials.password, user.password);

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
                expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

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
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.sessionToken) {
                token.sessionToken = user.sessionToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token?.sessionToken) {
                session.user.sessionToken = token.sessionToken;
            }
            return session;
        }
    }
};

export default NextAuth(authOptions); 