import { readAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/session";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  // Layout already gates rendering; this is a defensive short-circuit so we don't read
  // the audit log for unauthenticated requests.
  if (!session) return null;

  const all = await readAuditLog();
  // Admins see all activity; regular users see only their own entries.
  const filtered = session.role === "admin" ? all : all.filter((e) => e.userEmail === session.email);
  const recent = filtered.slice(-8).reverse();
  return <Dashboard recent={recent} />;
}
