// src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminPageClient from "./AdminPageClient";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // not signed in — send to login
    redirect("/admin/login");
  }
  // signed in — show the client‐side admin console
  return <AdminPageClient />;
}
