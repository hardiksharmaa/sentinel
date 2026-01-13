// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        // We do NOT attach the image here to keep the cookie small.
        // Your dashboard fetches the image directly from the DB.
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.uid = user.id;
        
        // 🚨 CRITICAL FIX: 
        // Explicitly remove the image from the token.
        // This prevents the "Header Too Large" (4KB cookie limit) error
        // when you store large Base64 images in the database.
        token.picture = null; 
      }

      // Handle session updates (if you use update() on client)
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user, picture: null };
      }

      return token;
    },
  },
};