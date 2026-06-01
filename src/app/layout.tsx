import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/session";
import LoginForm from "@/components/LoginForm";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Legal documents — Making Sense",
  description: "Internal document generator for NDAs, MSAs, SOWs and Amendments.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/ms-ds/tokens.css" />
      </head>
      <body>
        {session ? (
          <AppShell email={session.email} role={session.role}>
            {children}
          </AppShell>
        ) : (
          <LoginForm />
        )}
      </body>
    </html>
  );
}
