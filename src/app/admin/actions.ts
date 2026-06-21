"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function audit(action: string, entityType: string, entityId: string | null, metadata = {}) {
  const admin = await requireAdmin();
  await query(
    `insert into admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [admin.id, action, entityType, entityId, JSON.stringify(metadata)],
  );
}

export async function updateUserStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readString(formData, "userId");
  const status = readString(formData, "status");

  if (!userId || !["active", "suspended"].includes(status)) return;
  if (userId === admin.id) return;

  await query("update users set status = $1, updated_at = now() where id = $2", [status, userId]);
  await audit("update_status", "user", userId, { status });
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readString(formData, "userId");
  const role = readString(formData, "role");

  if (!userId || !["admin", "user"].includes(role)) return;
  if (userId === admin.id) return;

  await query("update users set role = $1, updated_at = now() where id = $2", [role, userId]);
  await audit("update_role", "user", userId, { role });
  revalidatePath("/admin/users");
}

export async function createTemplateAction(formData: FormData) {
  const admin = await requireAdmin();
  const code = readString(formData, "code").toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const category = readString(formData, "category") || "wedding";

  if (!code || !name) {
    redirect("/admin/templates?error=invalid");
  }

  const result = await query<{ id: string }>(
    `insert into templates (code, name, description, category, created_by)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [code, name, description || null, category, admin.id],
  );

  await audit("create", "template", result.rows[0].id, { code, name });
  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}

export async function toggleTemplateAction(formData: FormData) {
  const templateId = readString(formData, "templateId");
  const isActive = readString(formData, "isActive") === "true";

  if (!templateId) return;

  await query("update templates set is_active = $1, updated_at = now() where id = $2", [!isActive, templateId]);
  await audit("toggle_active", "template", templateId, { is_active: !isActive });
  revalidatePath("/admin/templates");
}
