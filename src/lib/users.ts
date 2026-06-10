// Server-only — reads/writes data/users.json. Identity now comes from Google SSO,
// so users.json is just a whitelist + role map. The optional passwordHash field
// is kept for backwards compatibility with older deployments; new entries never set it.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type UserRole = "admin" | "user";

export interface UserRecord {
  email: string;
  role: UserRole;
  createdAt: string;
  /** @deprecated Pre-SSO field, ignored by the auth flow. */
  passwordHash?: string;
}

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

export async function readUsers(): Promise<UserRecord[]> {
  try {
    return JSON.parse(await readFile(USERS_PATH, "utf8"));
  } catch {
    return [];
  }
}

export async function writeUsers(users: UserRecord[]): Promise<void> {
  await mkdir(path.dirname(USERS_PATH), { recursive: true });
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

export async function findUser(email: string): Promise<UserRecord | null> {
  const e = email.toLowerCase();
  const all = await readUsers();
  return all.find((u) => u.email.toLowerCase() === e) ?? null;
}

export async function upsertUser(record: UserRecord): Promise<void> {
  const all = await readUsers();
  const i = all.findIndex((u) => u.email.toLowerCase() === record.email.toLowerCase());
  if (i >= 0) all[i] = { ...all[i], ...record };
  else all.push(record);
  await writeUsers(all);
}
