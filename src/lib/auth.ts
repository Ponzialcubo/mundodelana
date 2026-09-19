import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/session";

// Auth.js is used only to run Google's OAuth handshake safely (state/PKCE,
// token exchange). It never issues its own session: the "signIn" callback
// below links/creates the Customer row and hands off to the app's own
// md_customer_session cookie (see src/lib/session.ts), so the rest of the
// app keeps treating email+password and Google sign-in identically.
export const { handlers } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  // Runs behind Nginx Proxy Manager: Auth.js needs to trust the
  // X-Forwarded-Host it receives instead of the internal container host.
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email || !account.providerAccountId) return false;

      const existing = await prisma.customer.findFirst({
        where: { OR: [{ googleId: account.providerAccountId }, { email: user.email }] },
      });

      const customer = existing
        ? await prisma.customer.update({
            where: { id: existing.id },
            data: { googleId: account.providerAccountId },
          })
        : await prisma.customer.create({
            data: {
              name: user.name || user.email.split("@")[0],
              email: user.email,
              googleId: account.providerAccountId,
            },
          });

      await createCustomerSession(customer.id);
      return true;
    },
  },
});
