"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createInvitation, updateInvitation, publishInvitation } from "./actions";
import type { InvitationFormData, EventData, GalleryItem, StoryItem } from "./types";

const emptyForm: InvitationFormData = {
  title: "Undangan Pernikahan",
  cover: { title: "", coverPhotoUrl: "", coverTextTop: "", coverTextBottom: "" },
  couple: { brideName: "", brideParents: "", bridePhotoUrl: "", groomName: "", groomParents: "", groomPhotoUrl: "", instagram: "" },
  events: [emptyEvent()],
  gallery: [],
  stories: [],
  extra: { music: { url: "", autoplay: false }, quotes: { text: "", source: "" } },
};

function emptyEvent(): EventData {
  return { title: "", description: "", eventDate: "", startTime: "", endTime: "", venueName: "", venueAddress: "", mapUrl: "" };
}

type SectionKey = "cover" | "couple" | "events" | "gallery" | "story" | "extra" | "review";

const sections: { key: SectionKey; label: string }[] = [
  { key: "cover", label: "Cover & Judul" },
  { key: "couple", label: "Mempelai" },
  { key: "events", label: "Acara" },
  { key: "gallery", label: "Galeri" },
  { key: "story", label: "Story" },
  { key: "extra", label: "Tambahan" },
  { key: "review", label: "Review & Publish" },
];

// ── Helper: check if a section has minimal content ──

function sectionFilled(data: InvitationFormData, key: SectionKey): boolean {
  switch (key) {
    case "cover":
      return !!data.cover.coverPhotoUrl || !!data.cover.title || !!data.cover.coverTextTop;
    case "couple":
      return !!data.couple.brideName || !!data.couple.groomName;
    case "events":
      return data.events.length > 0 && data.events.some((e) => e.title || e.eventDate);
    case "gallery":
      return data.gallery.length > 0;
    case "story":
      return data.stories.length > 0;
    case "extra":
      return !!data.extra.music.url || !!data.extra.quotes.text;
    case "review":
      return true;
  }
}

export default function InvitationEditor({ initialData }: { initialData?: InvitationFormData }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("cover");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<InvitationFormData>(initialData || { ...emptyForm });

  const update = <K extends keyof InvitationFormData>(key: K, val: InvitationFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const filled = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const s of sections) {
      map[s.key] = sectionFilled(data, s.key);
    }
    return map;
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (initialData?.id) {
        await updateInvitation(initialData.id, data);
        setSuccess("Tersimpan!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        const result = await createInvitation(data);
        setSuccess("Undangan berhasil dibuat!");
        setTimeout(() => router.push(`/dashboard/invitations/${result.id}/edit`), 1000);
      }
    } catch (e: any) {
      setError(e?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!initialData?.id) return;
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await updateInvitation(initialData.id, data);
      await publishInvitation(initialData.id);
      setSuccess("Undangan berhasil dipublikasikan!");
    } catch (e: any) {
      setError(e?.message || "Gagal publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] gap-0 rounded-2xl border border-[#eadcc6] bg-white/40">
      {/* ── Sidebar ── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-[#eadcc6] p-5">
        <nav className="flex-1 space-y-1">
          {sections.map((s) => {
            const isActive = activeSection === s.key;
            const isFilled = filled[s.key];
            return (
              <div
                key={s.key}
                role="button"
                tabIndex={0}
                onClick={() => setActiveSection(s.key)}
                onKeyDown={(e) => { if (e.key === 'Enter') setActiveSection(s.key); }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-[#2b2118] font-medium text-white"
                    : "text-[#6f5f4d] hover:bg-[#eadcc6]/40 hover:text-[#2b2118]"
                }`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  isFilled
                    ? "bg-[#c9a45c] text-white"
                    : "border border-[#eadcc6] text-[#a47b3d]"
                }`}>
                  {isFilled ? "✓" : ""}
                </span>
                <span className="truncate">{s.label}</span>
              </div>
            );
          })}
        </nav>

        {/* ── Bottom actions ── */}
        <div className="mt-6 space-y-2 border-t border-[#eadcc6] pt-4">
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">{success}</p>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-[#c9a45c] py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b38f3d] disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Draft"}
          </button>
          {initialData?.id && (
            <>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full rounded-lg border border-[#2b2118] py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#2b2118] transition-colors hover:bg-[#2b2118] hover:text-white disabled:opacity-50"
              >
                {publishing ? "Mempublikasi..." : "Publish"}
              </button>
              <a
                href={`/undangan/${initialData.slug || ""}`}
                target="_blank"
                className="block w-full rounded-lg border border-[#eadcc6] py-2.5 text-center text-xs text-[#6f5f4d] transition-colors hover:border-[#c9a45c] hover:text-[#c9a45c]"
              >
                Lihat Undangan
              </a>
            </>
          )}
        </div>
      </aside>

      {/* ── Panel ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeSection === "cover" && <CoverStep data={data} update={update} />}
        {activeSection === "couple" && <CoupleStep data={data} update={update} />}
        {activeSection === "events" && <EventsStep data={data} update={update} />}
        {activeSection === "gallery" && <GalleryStep data={data} update={update} />}
        {activeSection === "story" && <StoryStep data={data} update={update} />}
        {activeSection === "extra" && <ExtraStep data={data} update={update} />}
        {activeSection === "review" && <ReviewStep data={data} initialData={initialData} />}
      </div>
    </div>
  );
}

// ── Step 0: Cover ──

function CoverStep({ data, update }: { data: InvitationFormData; update: any }) {
  const c = data.cover;
  const set = (k: string, v: string) => update("cover", { ...c, [k]: v });

  return (
    <div className="space-y-5">
      <SectionTitle>Cover & Judul</SectionTitle>
      <Input label="Judul Undangan" value={data.title} onChange={(v) => update("title", v)} />
      <Input label="Teks Atas Cover (opsional)" value={c.coverTextTop} onChange={(v) => set("coverTextTop", v)} placeholder="Assalamu'alaikum Wr. Wb." />
      <Input label="Teks Bawah Cover (opsional)" value={c.coverTextBottom} onChange={(v) => set("coverTextBottom", v)} placeholder="Tanpa mengurangi rasa hormat..." />
      <Input label="URL Foto Cover" value={c.coverPhotoUrl} onChange={(v) => set("coverPhotoUrl", v)} placeholder="https://..." />
    </div>
  );
}

// ── Step 1: Mempelai ──

function CoupleStep({ data, update }: { data: InvitationFormData; update: any }) {
  const c = data.couple;
  const set = (k: string, v: string) => update("couple", { ...c, [k]: v });

  return (
    <div className="space-y-5">
      <SectionTitle>Informasi Mempelai</SectionTitle>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Mempelai Wanita</h3>
        <div className="space-y-4">
          <Input label="Nama" value={c.brideName} onChange={(v) => set("brideName", v)} />
          <Input label="Nama Orang Tua" value={c.brideParents} onChange={(v) => set("brideParents", v)} placeholder="Putri dari Bpk. ... & Ibu ..." />
          <Input label="URL Foto" value={c.bridePhotoUrl} onChange={(v) => set("bridePhotoUrl", v)} placeholder="https://..." />
        </div>
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Mempelai Pria</h3>
        <div className="space-y-4">
          <Input label="Nama" value={c.groomName} onChange={(v) => set("groomName", v)} />
          <Input label="Nama Orang Tua" value={c.groomParents} onChange={(v) => set("groomParents", v)} placeholder="Putra dari Bpk. ... & Ibu ..." />
          <Input label="URL Foto" value={c.groomPhotoUrl} onChange={(v) => set("groomPhotoUrl", v)} placeholder="https://..." />
        </div>
      </div>

      <Input label="Instagram (opsional)" value={c.instagram} onChange={(v) => set("instagram", v)} placeholder="@username" />
    </div>
  );
}

// ── Step 2: Acara ──

function EventsStep({ data, update }: { data: InvitationFormData; update: any }) {
  const events = data.events;
  const setEvents = (e: EventData[]) => update("events", e);

  const add = () => setEvents([...events, emptyEvent()]);
  const remove = (i: number) => setEvents(events.filter((_, idx) => idx !== i));
  const setEv = (i: number, k: keyof EventData, v: string) => {
    const copy = [...events];
    copy[i] = { ...copy[i], [k]: v };
    setEvents(copy);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Detail Acara</SectionTitle>
        <button onClick={add} className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#c9a45c] transition-colors hover:border-[#c9a45c]">
          + Tambah Acara
        </button>
      </div>

      {events.length === 0 && <p className="text-sm text-[#a47b3d]">Belum ada acara.</p>}

      {events.map((ev, i) => (
        <div key={i} className="relative rounded-xl border border-[#eadcc6] p-5">
          {events.length > 1 && (
            <button onClick={() => remove(i)} className="absolute right-4 top-4 text-xs text-red-400 hover:text-red-600">
              Hapus
            </button>
          )}
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Acara {i + 1}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Judul Acara" value={ev.title} onChange={(v) => setEv(i, "title", v)} placeholder="Akad Nikah" />
            <div />
            <Input label="Tanggal" value={ev.eventDate} onChange={(v) => setEv(i, "eventDate", v)} type="date" />
            <div className="flex gap-3">
              <Input label="Mulai" value={ev.startTime} onChange={(v) => setEv(i, "startTime", v)} type="time" />
              <Input label="Selesai" value={ev.endTime} onChange={(v) => setEv(i, "endTime", v)} type="time" />
            </div>
            <Input label="Nama Tempat" value={ev.venueName} onChange={(v) => setEv(i, "venueName", v)} placeholder="Gedung Serbaguna" />
            <Input label="Alamat" value={ev.venueAddress} onChange={(v) => setEv(i, "venueAddress", v)} placeholder="Jl. ..." />
            <Input label="URL Google Maps (opsional)" value={ev.mapUrl} onChange={(v) => setEv(i, "mapUrl", v)} placeholder="https://maps.app.goo.gl/..." />
            <Input labelJudul={false} label="Deskripsi" value={ev.description} onChange={(v) => setEv(i, "description", v)} placeholder="Informasi tambahan..." />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 3: Galeri ──

function GalleryStep({ data, update }: { data: InvitationFormData; update: any }) {
  const items = data.gallery;
  const setItems = (g: GalleryItem[]) => update("gallery", g);

  const add = (type: "image" | "video") => setItems([...items, { type, url: "", caption: "" }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const setItem = (i: number, k: keyof GalleryItem, v: string) => {
    const copy = [...items];
    (copy[i] as any)[k] = v;
    setItems(copy);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Galeri Foto &amp; Video</SectionTitle>
        <div className="flex gap-2">
          <button onClick={() => add("image")} className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#c9a45c] transition-colors hover:border-[#c9a45c]">
            + Foto
          </button>
          <button onClick={() => add("video")} className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#c9a45c] transition-colors hover:border-[#c9a45c]">
            + Video
          </button>
        </div>
      </div>

      {items.length === 0 && <p className="text-sm text-[#a47b3d]">Belum ada galeri.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((g, i) => (
          <div key={i} className="relative rounded-xl border border-[#eadcc6] p-4">
            <button onClick={() => remove(i)} className="absolute right-3 top-3 text-xs text-red-400 hover:text-red-600">X</button>
            <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
              g.type === "image" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
            }`}>{g.type}</span>
            <div className="mt-2 space-y-2">
              <input type="text" value={g.url} onChange={(e) => setItem(i, "url", e.target.value)}
                placeholder={g.type === "image" ? "https://...jpg" : "https://youtube.com/..."}
                className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none" />
              <input type="text" value={g.caption} onChange={(e) => setItem(i, "caption", e.target.value)}
                placeholder="Caption (opsional)"
                className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Story ──

function StoryStep({ data, update }: { data: InvitationFormData; update: any }) {
  const stories = data.stories;
  const setStories = (s: StoryItem[]) => update("stories", s);

  const add = () => setStories([...stories, { title: "", subtitle: "", content: "", storyDate: "", imageUrl: "" }]);
  const remove = (i: number) => setStories(stories.filter((_, idx) => idx !== i));
  const setStory = (i: number, k: keyof StoryItem, v: string) => {
    const copy = [...stories];
    (copy[i] as any)[k] = v;
    setStories(copy);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Story / Timeline</SectionTitle>
        <button onClick={add} className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#c9a45c] transition-colors hover:border-[#c9a45c]">
          + Tambah Cerita
        </button>
      </div>

      {stories.length === 0 && <p className="text-sm text-[#a47b3d]">Belum ada cerita.</p>}

      {stories.map((s, i) => (
        <div key={i} className="relative rounded-xl border border-[#eadcc6] p-5">
          <button onClick={() => remove(i)} className="absolute right-4 top-4 text-xs text-red-400 hover:text-red-600">Hapus</button>
          <div className="space-y-4">
            <Input label="Judul Cerita" value={s.title} onChange={(v) => setStory(i, "title", v)} placeholder="Pertemuan Pertama" />
            <Input label="Sub Judul" value={s.subtitle} onChange={(v) => setStory(i, "subtitle", v)} placeholder="2019" />
            <textarea value={s.content} onChange={(e) => setStory(i, "content", e.target.value)}
              placeholder="Ceritanya..."
              rows={3}
              className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Tanggal" value={s.storyDate} onChange={(v) => setStory(i, "storyDate", v)} type="date" />
              <Input label="URL Gambar" value={s.imageUrl} onChange={(v) => setStory(i, "imageUrl", v)} placeholder="https://..." />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 5: Tambahan ──

function ExtraStep({ data, update }: { data: InvitationFormData; update: any }) {
  const e = data.extra;
  const set = (k: string, v: any) => update("extra", { ...e, [k]: v });

  return (
    <div className="space-y-5">
      <SectionTitle>Informasi Tambahan</SectionTitle>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Musik Latar</h3>
        <Input label="URL Musik (YouTube/Spotify)" value={e.music.url} onChange={(v) => set("music", { ...e.music, url: v })} placeholder="https://youtube.com/watch?v=..." />
        <label className="mt-3 flex items-center gap-2 text-sm text-[#6f5f4d]">
          <input type="checkbox" checked={e.music.autoplay} onChange={(ev) => set("music", { ...e.music, autoplay: ev.target.checked })} className="accent-[#c9a45c]" />
          Putar otomatis saat halaman dibuka
        </label>
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Quotes / Doa</h3>
        <textarea value={e.quotes.text} onChange={(ev) => set("quotes", { ...e.quotes, text: ev.target.value })}
          placeholder="&quot;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup...&quot;"
          rows={3}
          className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm italic text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none" />
        <div className="mt-3">
          <Input label="Sumber (opsional)" value={e.quotes.source} onChange={(v) => set("quotes", { ...e.quotes, source: v })} placeholder="QS. Ar-Rum: 21" />
        </div>
      </div>
    </div>
  );
}

// ── Step 6: Review ──

function ReviewStep({ data, initialData }: { data: InvitationFormData; initialData?: InvitationFormData }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Review Undangan</SectionTitle>
      <p className="text-sm text-[#6f5f4d]">Semua data sudah siap. Gunakan tombol di sidebar untuk menyimpan atau mempublikasikan.</p>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Cover</h3>
        <p className="text-sm"><span className="text-[#6f5f4d]">Judul:</span> {data.title || "-"}</p>
        <p className="text-sm"><span className="text-[#6f5f4d]">Teks Atas:</span> {data.cover.coverTextTop || "-"}</p>
        <p className="text-sm"><span className="text-[#6f5f4d]">Teks Bawah:</span> {data.cover.coverTextBottom || "-"}</p>
        {data.cover.coverPhotoUrl && (
          <img src={data.cover.coverPhotoUrl} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Mempelai</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#a47b3d]">Wanita</p>
            <p className="text-sm font-medium">{data.couple.brideName || "-"}</p>
            <p className="text-xs text-[#6f5f4d]">{data.couple.brideParents || ""}</p>
          </div>
          <div>
            <p className="text-xs text-[#a47b3d]">Pria</p>
            <p className="text-sm font-medium">{data.couple.groomName || "-"}</p>
            <p className="text-xs text-[#6f5f4d]">{data.couple.groomParents || ""}</p>
          </div>
        </div>
        {data.couple.instagram && <p className="mt-2 text-xs text-[#6f5f4d]">IG: {data.couple.instagram}</p>}
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Acara ({data.events.length})</h3>
        {data.events.map((ev, i) => (
          <div key={i} className="mb-3 border-b border-[#eadcc6]/50 pb-3 last:mb-0 last:border-0 last:pb-0">
            <p className="text-sm font-medium">{ev.title || `Acara ${i + 1}`}</p>
            <p className="text-xs text-[#6f5f4d]">{ev.eventDate} {ev.startTime && `• ${ev.startTime}`}</p>
            <p className="text-xs text-[#6f5f4d]">{ev.venueName}{ev.venueAddress && `, ${ev.venueAddress}`}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Galeri ({data.gallery.length} item)</h3>
        <p className="text-xs text-[#6f5f4d]">{data.gallery.filter((g) => g.type === "image").length} foto, {data.gallery.filter((g) => g.type === "video").length} video</p>
      </div>

      <div className="rounded-xl border border-[#eadcc6] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#c9a45c]">Story ({data.stories.length} cerita)</h3>
        {data.stories.map((s, i) => (
          <p key={i} className="text-sm">• <span className="font-medium">{s.title}</span> {s.storyDate && <span className="text-xs text-[#6f5f4d]">({s.storyDate})</span>}</p>
        ))}
      </div>
    </div>
  );
}

// ── Reusable Components ──

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-3xl tracking-[-0.02em] text-[#2b2118]">{children}</h2>;
}

function Input({ label, value, onChange, placeholder, type = "text", className = "", labelJudul = true }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string; labelJudul?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {labelJudul && <label className="text-xs uppercase tracking-[0.15em] text-[#a47b3d]">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none" />
    </div>
  );
}
