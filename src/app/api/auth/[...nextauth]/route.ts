// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // credentials will always be defined here, never undefined
      async authorize(
        credentials: Record<"username" | "password", string> | undefined
      ) {
        if (!credentials) return null;
        const { username, password } = credentials;
        if (
          username === process.env.ADMIN_USER &&
          password === process.env.ADMIN_PASS
        ) {
          return { id: username };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
};

const handler = NextAuth(authOptions);

// Export only the route handlers—Next.js will wire up GET/POST for you
export { handler as GET, handler as POST };
