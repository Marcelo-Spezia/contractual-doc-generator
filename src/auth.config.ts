// NextAuth v4 configuration. Shared by the [...nextauth] route handler and any
// server-side code that needs to read the session (via getServerSession).
import type { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { findUser } from "@/lib/users";

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

export const authOptions: AuthOptions = {
  // Reuse the existing AUTH_SECRET so deployments don't need a second variable.
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          // hd restricts the Google account picker to the makingsense.com Workspace.
          // Defense in depth — even if the OAuth client gets misconfigured to External,
          // Google still rejects accounts outside this domain before the callback fires.
          hd: "makingsense.com",
          prompt: "select_account",
        },
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: SESSION_TTL_SECONDS },
  pages: {
    // Render our own sign-in UI at "/" — NextAuth's default page is plain and off-brand.
    signIn: "/",
  },
  callbacks: {
    /** Whitelist check: only emails present in data/users.json may sign in. */
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      if (!email.endsWith("@makingsense.com")) return false;
      const user = await findUser(email);
      return !!user;
    },
    /** Attach role from users.json to the JWT on initial sign-in. */
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await findUser(profile.email);
        if (user) {
          token.email = user.email;
          token.role = user.role;
        }
      }
      return token;
    },
    /** Surface email + role on the session object for downstream code. */
    async session({ session, token }) {
      if (token.email) session.user.email = String(token.email);
      if (token.role) session.user.role = token.role as "admin" | "user";
      return session;
    },
  },
};
