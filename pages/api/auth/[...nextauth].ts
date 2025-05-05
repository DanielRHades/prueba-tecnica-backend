import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";
import { loginUserWithCredentials } from "@/services/auth.service";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                return loginUserWithCredentials(
                    credentials?.email || "",
                    credentials?.password || ""
                );
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
