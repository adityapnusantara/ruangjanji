"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateToken } from "./guest-utils";

// ── Types ──

export type GuestRow = {
  id: string;
  invitation_id: string;
  name: string;
  phone: string | null;
  group_name: string | null;
  token: string;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
};

// ── CRUD ──

export async function getGuests(invitationId: string): Promise<GuestRow[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const inv = await query<{ id: string }>(
    `select id from invitations where id = $1 and user_id = $2 limit 1`,
    [invitationId, user.id],
  );
  if (inv.rows.length === 0) redirect("/dashboard");

  const result = await query<GuestRow>(
    `select id, invitation_id, name, phone, group_name, token, sent_at, opened_at, created_at
     from guests
     where invitation_id = $1
     order by created_at desc`,
    [invitationId],
  );

  return result.rows;
}

export async function addGuest(
  invitationId: string,
  data: { name: string; phone?: string; group_name?: string },
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const token = generateToken();

  await query(
    `insert into guests (invitation_id, name, phone, group_name, token)
     values ($1, $2, $3, $4, $5)`,
    [invitationId, data.name, data.phone || null, data.group_name || null, token],
  );

  revalidatePath(`/dashboard/invitations/${invitationId}/guests`);
}

export async function addMultipleGuests(
  invitationId: string,
  guests: { name: string; phone?: string; group_name?: string }[],
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  for (const g of guests) {
    const token = generateToken();
    await query(
      `insert into guests (invitation_id, name, phone, group_name, token)
       values ($1, $2, $3, $4, $5)`,
      [invitationId, g.name, g.phone || null, g.group_name || null, token],
    );
  }

  revalidatePath(`/dashboard/invitations/${invitationId}/guests`);
}

export async function deleteGuest(invitationId: string, guestId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await query(
    `delete from guests where id = $1 and invitation_id = $2`,
    [guestId, invitationId],
  );

  revalidatePath(`/dashboard/invitations/${invitationId}/guests`);
}

export async function markAsSent(invitationId: string, guestId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await query(
    `update guests set sent_at = now() where id = $1 and invitation_id = $2`,
    [guestId, invitationId],
  );

  revalidatePath(`/dashboard/invitations/${invitationId}/guests`);
}

// ── Get guest by token (for public page) ──

export async function getGuestByToken(token: string) {
  const result = await query<GuestRow>(
    `select id, invitation_id, name, phone, group_name, token, sent_at, opened_at, created_at
     from guests
     where token = $1
     limit 1`,
    [token],
  );

  if (result.rows.length > 0) {
    await query(
      `update guests set opened_at = now() where id = $1 and opened_at is null`,
      [result.rows[0].id],
    );
  }

  return result.rows[0] || null;
}

// ── Get invitation slug by ID ──

export async function getInvitationSlug(invitationId: string): Promise<string | null> {
  const result = await query<{ slug: string }>(
    `select slug from invitations where id = $1 limit 1`,
    [invitationId],
  );
  return result.rows[0]?.slug || null;
}
