import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/password";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

export type UserRole = "admin" | "user";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials.");
        }

        const user = await User.findOne({ email: credentials.email }).lean() as any;
        if (!user) throw new Error("Invalid email or password.");

        // Enforce suspensions
        if (user.active === false) {
          if (user.suspendedUntil) {
            const now = new Date();
            if (now < new Date(user.suspendedUntil)) {
              throw new Error(`Account suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. Reason: ${user.suspensionReason || 'Violation of terms.'}`);
            } else {
              // Suspension has expired, reactivate them
              await User.findByIdAndUpdate(user._id, { active: true, suspendedUntil: null, suspensionReason: "" });
            }
          } else {
             // Indefinite ban
             throw new Error(`Account permanently suspended. Reason: ${user.suspensionReason || 'Violation of terms.'}`);
          }
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid email or password.");

        return {
          id: user._id.toString(),
          name: user.name || null,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = (user as any).name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.name = token.name as string | undefined;

      return session;
    },
  },
};
