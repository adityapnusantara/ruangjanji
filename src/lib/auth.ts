import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export type AppUser = {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "user";
  status: "active" | "suspended";
};

const SESSION_COOKIE = "rj_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const actual = Buffer.from(hash, "hex");
  const expected = scryptSync(password, salt, 64);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function getUserByEmail(email: string) {
  const result = await query<AppUser & { password_hash: string | null }>(
    `select id, name, email, role, status, password_hash
     from users
     where lower(email) = lower($1)
     limit 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function getUserById(id: string) {
  const result = await query<AppUser>(
    `select id, name, email, role, status
     from users
     where id = $1
     limit 1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const passwordHash = hashPassword(input.password);
  const result = await query<AppUser>(
    `insert into users (name, email, password_hash, auth_provider, role, status)
     values ($1, lower($2), $3, 'credentials', 'user', 'active')
     returning id, name, email, role, status`,
    [input.name, input.email, passwordHash],
  );

  return result.rows[0];
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const user = await getUserById(userId);
  if (!user || user.status !== "active") return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
