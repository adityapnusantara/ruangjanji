import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const message = formData.get("message") as string;

  if (!name || !message) {
    return NextResponse.redirect(new URL(`/undangan/${slug}?error=required`, request.url));
  }

  const inv = await query<{ id: string }>(
    `select id from invitations where slug = $1 limit 1`,
    [slug],
  );

  if (inv.rows.length === 0) {
    return NextResponse.redirect(new URL(`/undangan/${slug}?error=not_found`, request.url));
  }

  await query(
    `insert into wishes (invitation_id, name, message)
     values ($1, $2, $3)`,
    [inv.rows[0].id, name, message],
  );

  return NextResponse.redirect(new URL(`/undangan/${slug}?wish=success`, request.url));
}
