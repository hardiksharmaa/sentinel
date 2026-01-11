// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // 1. Adapter: Tells NextAuth to store data in our Prisma/Neon DB
  adapter: PrismaAdapter(prisma),

  // 2. Providers: The list of ways to log in
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // 3. Session Strategy: We use JWT (JSON Web Tokens) for speed
  session: {
    strategy: "jwt",
  },

  // 4. Callbacks: Customize the session object
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // We add the User ID to the session so we can use it easily in the app
        // (e.g., "Find all monitors for user.id")
        session.user.id = token.sub!; 
      }
      return session;
    },
  },
};