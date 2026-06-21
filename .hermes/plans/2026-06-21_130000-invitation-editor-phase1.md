# Plan: Invitation Editor + Public Page (Phase 1)

## Goal
Build invitation multi-step editor + public invitation page for RuangJanji.

## Data Flow
- `invitations.settings` JSONB holds: cover, bride/groom info, music URL, quotes
- `events` table = multiple events per invitation (akad, resepsi, etc.)
- `gallery_items` table = images + video links
- `stories` table = love story timeline

## Steps

### 1. Create server actions (`src/app/dashboard/invitations/actions.ts`)
- `createInvitation(formData)` - creates invitation + slug + initial empty settings
- `updateInvitation(id, settings, events, gallery, stories)` - upserts all related tables
- `getInvitation(id)` - fetches invitation + all related data
- `generateSlug(title)` - slug from title + random suffix
- Using raw SQL via `query()` from `@/lib/db`

### 2. Create types file (`src/app/dashboard/invitations/types.ts`)
- TypeScript interfaces for all form steps
- Settings shape: `{ cover, bride, groom, music, quotes }`

### 3. Multi-step editor (`src/app/dashboard/invitations/new/page.tsx`)
Client component with steps:
1. **Cover** - title, cover text top, cover text bottom, cover photo URL
2. **Mempelai** - bride name, groom name, bride photo, groom photo, bride parents, groom parents, Instagram
3. **Acara** - dynamic list of events (title, desc, date, time, venue, map URL)
4. **Galeri** - add image URLs + video links with captions, sortable
5. **Story** - timeline items (title, subtitle, content, date, image)
6. **Tambahan** - music URL (YouTube/Spotify embed), quotes/doa text
7. **Review + Publish** - preview summary, choose template, publish button

### 4. Edit page (`src/app/dashboard/invitations/[id]/edit/page.tsx`)
- Load existing invitation data
- Reuse the multi-step editor component with pre-filled values
- Save updates

### 5. Public invitation page (`src/app/undangan/[slug]/page.tsx`)
- Server component that fetches invitation by slug
- Renders: cover section, couple section, events, gallery, story, RSVP form, wishes form
- Premium editorial design matching RuangJanji aesthetic

### 6. Dashboard update (`src/app/dashboard/page.tsx`)
- Show existing invitations with edit/view/delete actions
- "Buat Undangan Baru" button linking to editor

## Files to create/modify
- NEW: `src/app/dashboard/invitations/actions.ts` - server actions
- NEW: `src/app/dashboard/invitations/types.ts` - TypeScript types
- NEW: `src/app/dashboard/invitations/new/page.tsx` - create form
- NEW: `src/app/dashboard/invitations/[id]/edit/page.tsx` - edit form
- NEW: `src/app/undangan/[slug]/page.tsx` - public page
- MODIFY: `src/app/dashboard/page.tsx` - link to editor + list invitations

## Validation
- `npm run build` after each major file
- Check public page renders for a created invitation

## Risks
- No image upload yet (Cloudinary not configured) — user enters URLs manually
- Session expires — need to handle redirect gracefully
- Large form state — using React's useState per step to avoid complexity
