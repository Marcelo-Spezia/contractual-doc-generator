import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { TemplateId } from "./schema";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  templateId: TemplateId;
  templateVersion: string;
  clientName: string;
  /** Project name for SOWs; blank for NDA/MSA/Amendment which have no project. */
  projectName: string;
  /** SOW number for SOWs, AMENDMENT_NUMBER for amendments, blank otherwise. */
  reference: string;
}

const LOG_PATH = path.join(process.cwd(), "data", "audit_log.json");

export async function readAuditLog(): Promise<AuditLogEntry[]> {
  try {
    return JSON.parse(await readFile(LOG_PATH, "utf8"));
  } catch {
    return [];
  }
}

export async function appendAuditEntry(
  entry: Omit<AuditLogEntry, "id" | "timestamp">,
): Promise<AuditLogEntry> {
  const log = await readAuditLog();
  const full: AuditLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  log.push(full);
  await writeFile(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
  return full;
}
