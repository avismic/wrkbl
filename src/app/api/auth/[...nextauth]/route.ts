// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (
          creds?.username === process.env.ADMIN_USER &&
          creds.password === process.env.ADMIN_PASS
        ) {
          return { id: creds.username };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
};

const handler = NextAuth(authOptions);

// these exports let Next.js know how to handle GET/POST
export { handler as GET, handler as POST };
