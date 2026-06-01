// Server-only — uses node:crypto. Importing from a client component will fail at build.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// scrypt params chosen for ~100ms hash on a modern Mac. Stored alongside the hash
// in case we tune them later.
const SCRYPT = { N: 16384, r: 8, p: 1, keyLen: 64 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keyLen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nS, rS, pS, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const got = scryptSync(password, salt, expected.length, {
    N: Number(nS),
    r: Number(rS),
    p: Number(pS),
  });
  return expected.length === got.length && timingSafeEqual(expected, got);
}
