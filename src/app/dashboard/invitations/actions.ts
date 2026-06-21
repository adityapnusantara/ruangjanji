"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { InvitationFormData, InvitationSummary } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function generateUniqueSlug(base: string): Promise<string> {
  const slug = slugify(base) || "undangan";
  const suffix = Math.random().toString(36).slice(2, 6);
  const candidate = `${slug}-${suffix}`;

  const existing = await query<{ id: string }>(
    `select id from invitations where slug = $1 limit 1`,
    [candidate],
  );
  if (existing.rows.length === 0) return candidate;

  // Collision — try again
  return generateUniqueSlug(base);
}

// ── Create ──

export async function createInvitation(formData: InvitationFormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const slug = await generateUniqueSlug(formData.title);

  const result = await query<{ id: string }>(
    `insert into invitations (user_id, title, slug, status, settings)
     values ($1, $2, $3, 'draft', $4::jsonb)
     returning id`,
    [
      user.id,
      formData.title,
      slug,
      JSON.stringify({
        cover: formData.cover,
        couple: formData.couple,
        extra: formData.extra,
      }),
    ],
  );

  const invitationId = result.rows[0].id;

  // Insert events
  for (let i = 0; i < formData.events.length; i++) {
    const ev = formData.events[i];
    await query(
      `insert into events (invitation_id, title, description, event_date, start_time, end_time, venue_name, venue_address, map_url, sort_order)
       values ($1, $2, $3, $4::date, $5::time, $6::time, $7, $8, $9, $10)`,
      [invitationId, ev.title, ev.description, ev.eventDate, ev.startTime, ev.endTime, ev.venueName, ev.venueAddress, ev.mapUrl, i],
    );
  }

  // Insert gallery
  for (let i = 0; i < formData.gallery.length; i++) {
    const g = formData.gallery[i];
    await query(
      `insert into gallery_items (invitation_id, type, url, caption, sort_order)
       values ($1, $2, $3, $4, $5)`,
      [invitationId, g.type, g.url, g.caption, i],
    );
  }

  // Insert stories
  for (let i = 0; i < formData.stories.length; i++) {
    const s = formData.stories[i];
    await query(
      `insert into stories (invitation_id, title, subtitle, content, story_date, image_url, sort_order)
       values ($1, $2, $3, $4, $5::date, $6, $7)`,
      [invitationId, s.title, s.subtitle, s.content, s.storyDate, s.imageUrl, i],
    );
  }

  revalidatePath("/dashboard");
  return { id: invitationId, slug };
}

// ── Read ──

export async function getInvitation(id: string): Promise<InvitationFormData | null> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invResult = await query<any>(
    `select id, title, slug, status, settings, template_id
     from invitations
     where id = $1 and user_id = $2
     limit 1`,
    [id, user.id],
  );

  if (invResult.rows.length === 0) return null;
  const inv = invResult.rows[0];

  const eventsResult = await query<any>(
    `select id, title, description, event_date, start_time, end_time, venue_name, venue_address, map_url
     from events where invitation_id = $1 order by sort_order`,
    [id],
  );

  const galleryResult = await query<any>(
    `select id, type, url, caption from gallery_items where invitation_id = $1 order by sort_order`,
    [id],
  );

  const storiesResult = await query<any>(
    `select id, title, subtitle, content, story_date, image_url from stories where invitation_id = $1 order by sort_order`,
    [id],
  );

  const settings = inv.settings || {};

  return {
    id: inv.id,
    title: inv.title,
    slug: inv.slug,
    templateId: inv.template_id,
    cover: settings.cover || { title: "", coverPhotoUrl: "", coverTextTop: "", coverTextBottom: "" },
    couple: settings.couple || { brideName: "", brideParents: "", bridePhotoUrl: "", groomName: "", groomParents: "", groomPhotoUrl: "", instagram: "" },
    extra: settings.extra || { music: { url: "", autoplay: false }, quotes: { text: "", source: "" } },
    events: eventsResult.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      eventDate: r.event_date ? r.event_date.toISOString().split("T")[0] : "",
      startTime: r.start_time ? r.start_time.slice(0, 5) : "",
      endTime: r.end_time ? r.end_time.slice(0, 5) : "",
      venueName: r.venue_name || "",
      venueAddress: r.venue_address || "",
      mapUrl: r.map_url || "",
    })),
    gallery: galleryResult.rows.map((r: any) => ({
      id: r.id,
      type: r.type as "image" | "video",
      url: r.url,
      caption: r.caption || "",
    })),
    stories: storiesResult.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle || "",
      content: r.content || "",
      storyDate: r.story_date ? r.story_date.toISOString().split("T")[0] : "",
      imageUrl: r.image_url || "",
    })),
  };
}

// ── Update ──

export async function updateInvitation(id: string, formData: InvitationFormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Update main invitation
  await query(
    `update invitations
     set title = $1, settings = $2::jsonb, updated_at = now()
     where id = $3 and user_id = $4`,
    [
      formData.title,
      JSON.stringify({
        cover: formData.cover,
        couple: formData.couple,
        extra: formData.extra,
      }),
      id,
      user.id,
    ],
  );

  // Replace events
  await query(`delete from events where invitation_id = $1`, [id]);
  for (let i = 0; i < formData.events.length; i++) {
    const ev = formData.events[i];
    await query(
      `insert into events (invitation_id, title, description, event_date, start_time, end_time, venue_name, venue_address, map_url, sort_order)
       values ($1, $2, $3, $4::date, $5::time, $6::time, $7, $8, $9, $10)`,
      [id, ev.title, ev.description, ev.eventDate, ev.startTime, ev.endTime, ev.venueName, ev.venueAddress, ev.mapUrl, i],
    );
  }

  // Replace gallery
  await query(`delete from gallery_items where invitation_id = $1`, [id]);
  for (let i = 0; i < formData.gallery.length; i++) {
    const g = formData.gallery[i];
    await query(
      `insert into gallery_items (invitation_id, type, url, caption, sort_order)
       values ($1, $2, $3, $4, $5)`,
      [id, g.type, g.url, g.caption, i],
    );
  }

  // Replace stories
  await query(`delete from stories where invitation_id = $1`, [id]);
  for (let i = 0; i < formData.stories.length; i++) {
    const s = formData.stories[i];
    await query(
      `insert into stories (invitation_id, title, subtitle, content, story_date, image_url, sort_order)
       values ($1, $2, $3, $4, $5::date, $6, $7)`,
      [id, s.title, s.subtitle, s.content, s.storyDate, s.imageUrl, i],
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/undangan/${formData.title}`);
}

// ── Publish / Archive ──

export async function publishInvitation(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Get slug
  const inv = await query<{ slug: string }>(
    `select slug from invitations where id = $1 and user_id = $2 limit 1`,
    [id, user.id],
  );
  if (inv.rows.length === 0) return;

  await query(
    `update invitations set status = 'published', published_at = now(), updated_at = now()
     where id = $1 and user_id = $2`,
    [id, user.id],
  );

  revalidatePath("/dashboard");
  revalidatePath(`/undangan/${inv.rows[0].slug}`);
}

export async function archiveInvitation(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await query(
    `update invitations set status = 'archived', updated_at = now()
     where id = $1 and user_id = $2`,
    [id, user.id],
  );

  revalidatePath("/dashboard");
}

// ── Delete ──

export async function deleteInvitation(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // CASCADE handles related tables
  await query(
    `delete from invitations where id = $1 and user_id = $2`,
    [id, user.id],
  );

  revalidatePath("/dashboard");
}

// ── List user's invitations ──

export async function getUserInvitations(): Promise<InvitationSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const result = await query<InvitationSummary>(
    `select id, title, slug, status, published_at, created_at
     from invitations
     where user_id = $1
     order by created_at desc`,
    [user.id],
  );

  return result.rows;
}

// ── Public: get invitation by slug ──

export type PublicInvitation = {
  id: string;
  title: string;
  slug: string;
  settings: any;
  template_id: string | null;
};

export async function getPublicInvitation(slug: string) {
  const invResult = await query<PublicInvitation>(
    `select id, title, slug, settings, template_id
     from invitations
     where slug = $1 and status = 'published'
     limit 1`,
    [slug],
  );

  if (invResult.rows.length === 0) return null;

  const inv = invResult.rows[0];
  const events = await query(
    `select * from events where invitation_id = $1 order by sort_order`,
    [inv.id],
  );
  const gallery = await query(
    `select * from gallery_items where invitation_id = $1 order by sort_order`,
    [inv.id],
  );
  const stories = await query(
    `select * from stories where invitation_id = $1 order by sort_order`,
    [inv.id],
  );

  return { ...inv, events: events.rows, gallery: gallery.rows, stories: stories.rows };
}

export async function getPublicWishes(invitationId: string) {
  const result = await query(
    `select id, name, message, created_at
     from wishes
     where invitation_id = $1 and is_visible = true
     order by created_at desc`,
    [invitationId],
  );
  return result.rows;
}
