// src/app/admin/consult-req/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ConsultReqClient from "./ConsultReqClient";

// This is a server component that handles authentication
export default async function ConsultReqPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // If not signed in, redirect to the login page
    redirect("/admin/login");
  }
  // If signed in, render the client component that fetches and displays data
  return <ConsultReqClient />;
}
