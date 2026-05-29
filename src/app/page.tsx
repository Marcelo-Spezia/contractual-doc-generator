import { readAuditLog } from "@/lib/audit";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const entries = (await readAuditLog()).slice(-8).reverse();
  return <Dashboard recent={entries} />;
}
