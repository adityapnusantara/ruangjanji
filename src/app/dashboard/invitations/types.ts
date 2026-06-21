// ── Invitation Settings Shape (stored in invitations.settings JSONB) ──

export type CoverSettings = {
  title: string;
  coverPhotoUrl: string;
  coverTextTop: string;
  coverTextBottom: string;
};

export type BrideGroomInfo = {
  brideName: string;
  brideParents: string;
  bridePhotoUrl: string;
  groomName: string;
  groomParents: string;
  groomPhotoUrl: string;
  instagram: string;
};

export type MusicSettings = {
  url: string;
  autoplay: boolean;
};

export type QuotesSettings = {
  text: string;
  source: string;
};

export type ExtraSettings = {
  music: MusicSettings;
  quotes: QuotesSettings;
};

// ── Event ──

export type EventData = {
  id?: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
};

// ── Gallery ──

export type GalleryItem = {
  id?: string;
  type: "image" | "video";
  url: string;
  caption: string;
};

// ── Story ──

export type StoryItem = {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  storyDate: string;
  imageUrl: string;
};

// ── Full Invitation Form Data ──

export type InvitationFormData = {
  id?: string;
  title: string;
  templateId?: string;
  cover: CoverSettings;
  couple: BrideGroomInfo;
  events: EventData[];
  gallery: GalleryItem[];
  stories: StoryItem[];
  extra: ExtraSettings;
};

// ── Summary for Dashboard List ──

export type InvitationSummary = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
};
