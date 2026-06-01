#!/usr/bin/env node
// Create or update a user in data/users.json.
//
// Usage:
//   ADMIN_PASSWORD=secret node scripts/create_user.mjs --email=alice@makingsense.com --role=admin
//
// Reading the password from an env var (instead of an argv flag) keeps it out of
// your shell history. The script never prints the plaintext password back.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
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
const password = process.env.ADMIN_PASSWORD;

if (!email) {
  console.error("Missing --email=...");
  process.exit(2);
}
if (!/^[^@\s]+@makingsense\.com$/.test(email)) {
  console.error("Email must end in @makingsense.com");
  process.exit(2);
}
if (!password || password.length < 8) {
  console.error("Missing ADMIN_PASSWORD env var (>= 8 chars)");
  process.exit(2);
}

const SCRYPT = { N: 16384, r: 8, p: 1, keyLen: 64 };
function hashPassword(plain) {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, SCRYPT.keyLen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

let users = [];
try {
  users = JSON.parse(await readFile(USERS_PATH, "utf8"));
} catch {
  /* first run */
}

const passwordHash = hashPassword(password);
const i = users.findIndex((u) => u.email.toLowerCase() === email);
const record = {
  email,
  passwordHash,
  role,
  createdAt: i >= 0 ? users[i].createdAt : new Date().toISOString(),
};
if (i >= 0) users[i] = record;
else users.push(record);

await mkdir(path.dirname(USERS_PATH), { recursive: true });
await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");

console.log(`${i >= 0 ? "Updated" : "Created"} ${role} user: ${email}`);
console.log(`Total users: ${users.length}`);
