/* ──────────────────────────────────────────────────────────────
   src/components/AuroraGate.tsx
   Mounts <Aurora> everywhere *except* /admin routes
──────────────────────────────────────────────────────────────── */
"use client";

import { usePathname } from "next/navigation";
import Aurora, { type AuroraProps } from "./Aurora";
import type { ReactElement } from "react";  // ✅ React types

/**
 * Forward all Aurora props, but skip rendering when the current
 * URL starts with “/admin”.
 */
export default function AuroraGate(props: AuroraProps): ReactElement | null {
  const pathname: string = usePathname();

  // Any route beginning with /admin (e.g. /admin, /admin/jobs, /admin/trash)
  // will *not* get the animated background.
  if (pathname.startsWith("/admin")) {
    return null;
  }
  if (pathname.startsWith("/solutions")) {
    return null;
  }

  return <Aurora {...props} />;
}
