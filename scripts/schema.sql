create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  email_verified_at timestamptz,
  password_hash text,
  auth_provider text not null default 'credentials',
  role text not null default 'user',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('admin', 'user')),
  constraint users_status_check check (status in ('active', 'suspended'))
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  category text,
  style_tags text[] not null default '{}',
  preview_image_url text,
  thumbnail_url text,
  config_schema jsonb not null default '{}'::jsonb,
  default_settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  is_premium boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  template_id uuid references templates(id) on delete set null,
  slug text not null unique,
  title text not null,
  status text not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null,
  phone text,
  group_name text,
  token text not null unique,
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  title text not null,
  description text,
  event_date date,
  start_time time,
  end_time time,
  venue_name text,
  venue_address text,
  map_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  type text not null,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint gallery_items_type_check check (type in ('image', 'video'))
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  title text not null,
  subtitle text,
  content text,
  story_date date,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  name text not null,
  attendance_status text not null,
  attendee_count integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  constraint rsvps_attendance_status_check check (attendance_status in ('attending', 'not_attending', 'maybe')),
  constraint rsvps_attendee_count_check check (attendee_count >= 0)
);

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  name text not null,
  message text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on users(email);
create index if not exists templates_active_sort_idx on templates(is_active, sort_order);
create index if not exists invitations_user_id_idx on invitations(user_id);
create index if not exists invitations_slug_idx on invitations(slug);
create index if not exists guests_invitation_id_idx on guests(invitation_id);
create index if not exists guests_token_idx on guests(token);
create index if not exists events_invitation_id_idx on events(invitation_id);
create index if not exists gallery_items_invitation_id_idx on gallery_items(invitation_id);
create index if not exists stories_invitation_id_idx on stories(invitation_id);
create index if not exists rsvps_invitation_id_idx on rsvps(invitation_id);
create index if not exists rsvps_guest_id_idx on rsvps(guest_id);
create unique index if not exists rsvps_one_per_guest_idx on rsvps(guest_id) where guest_id is not null;
create index if not exists wishes_invitation_id_idx on wishes(invitation_id);
create index if not exists wishes_visible_idx on wishes(invitation_id, is_visible);
create index if not exists admin_audit_logs_admin_idx on admin_audit_logs(admin_user_id);

insert into templates (code, name, description, category, style_tags, default_settings, sort_order)
values
  ('classic_gold', 'Classic Gold', 'Nuansa klasik dengan aksen champagne gold.', 'wedding', array['classic','gold','elegant'], '{"theme":{"color":"classic_gold","font":"serif"}}'::jsonb, 10),
  ('minimal_ivory', 'Minimal Ivory', 'Tampilan bersih, terang, dan editorial.', 'wedding', array['minimal','ivory','clean'], '{"theme":{"color":"minimal_ivory","font":"serif"}}'::jsonb, 20),
  ('romantic_rose', 'Romantic Rose', 'Lembut, hangat, dan romantis.', 'wedding', array['romantic','rose','soft'], '{"theme":{"color":"romantic_rose","font":"serif"}}'::jsonb, 30)
on conflict (code) do nothing;
