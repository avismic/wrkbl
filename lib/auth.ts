// src/lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // Use a JWT session strategy
  session: {
    strategy: "jwt",
  },

  // Specify your custom sign-in page
  pages: {
    signIn: "/admin/login",
  },

  // 💡 **ADD THIS**: pull in your NEXTAUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds) return null;
        const { username, password } = creds;
        // simple check against your env vars
        if (
          username === process.env.ADMIN_USER &&
          password === process.env.ADMIN_PASS
        ) {
          // you can include additional fields here if needed
          return { id: username, name: username };
        }
        return null;
      },
    }),
  ],
};

// Export the NextAuth route handler
export default NextAuth(authOptions);
