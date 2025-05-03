import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
        password?: string;
        sessionToken?: string;
    }

    interface Session {
        user: {
            role?: string;
            sessionToken?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        sessionToken?: string;
    }
} 