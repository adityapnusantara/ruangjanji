import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const attendance_status = formData.get("attendance_status") as string;
  const attendee_count = parseInt(formData.get("attendee_count") as string) || 1;
  const note = (formData.get("note") as string) || "";

  if (!name || !attendance_status) {
    return NextResponse.redirect(new URL(`/undangan/${slug}?error=required`, request.url));
  }

  // Look up invitation by slug to get invitation_id
  const inv = await query<{ id: string }>(
    `select id from invitations where slug = $1 limit 1`,
    [slug],
  );

  if (inv.rows.length === 0) {
    return NextResponse.redirect(new URL(`/undangan/${slug}?error=not_found`, request.url));
  }

  await query(
    `insert into rsvps (invitation_id, name, attendance_status, attendee_count, note)
     values ($1, $2, $3, $4, $5)`,
    [inv.rows[0].id, name, attendance_status, attendee_count, note],
  );

  return NextResponse.redirect(new URL(`/undangan/${slug}?rsvp=success`, request.url));
}
