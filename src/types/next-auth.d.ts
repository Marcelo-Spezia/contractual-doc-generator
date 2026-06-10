import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { email: string; role: "admin" | "user" } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user";
    email?: string;
  }
}
