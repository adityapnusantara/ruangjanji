"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, createUser, getUserByEmail, verifyPassword } from "@/lib/auth";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signupAction(formData: FormData) {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!name || !email || password.length < 8) {
    redirect("/signup?error=invalid");
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    redirect("/signup?error=email_used");
  }

  const user = await createUser({ name, email, password });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  const user = await getUserByEmail(email);
  if (!user || user.status !== "active" || !verifyPassword(password, user.password_hash)) {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
