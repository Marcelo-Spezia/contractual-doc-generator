#!/usr/bin/env node
// Add or update a user in data/users.json so they can sign in via Google SSO.
// Identity comes from Google; this file is only a whitelist + role map.
//
// Usage:
//   node scripts/upsert_user.mjs --email=alice@makingsense.com --role=user
//   node scripts/upsert_user.mjs --email=mspezia@makingsense.com --role=admin

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.replace(/^--/, ""))
    .map((a) => {
      const eq = a.indexOf("=");
      return eq < 0 ? [a, "true"] : [a.slice(0, eq), a.slice(eq + 1)];
    }),
);

const email = String(args.email || "").trim().toLowerCase();
const role = args.role === "admin" ? "admin" : "user";

if (!email) {
  console.error("Missing --email=...");
  process.exit(2);
}
if (!/^[^@\s]+@makingsense\.com$/.test(email)) {
  console.error("Email must end in @makingsense.com");
  process.exit(2);
}

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

let users = [];
try {
  users = JSON.parse(await readFile(USERS_PATH, "utf8"));
} catch {
  /* first run */
}

const i = users.findIndex((u) => u.email.toLowerCase() === email);
const existing = i >= 0 ? users[i] : null;
const record = {
  email,
  role,
  createdAt: existing?.createdAt ?? new Date().toISOString(),
};
if (i >= 0) users[i] = { ...existing, ...record };
else users.push(record);

await mkdir(path.dirname(USERS_PATH), { recursive: true });
await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");

console.log(`${i >= 0 ? "Updated" : "Created"} ${role} user: ${email}`);
console.log(`Total users: ${users.length}`);
