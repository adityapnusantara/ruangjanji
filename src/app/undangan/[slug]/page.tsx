import { notFound } from "next/navigation";
import { getPublicInvitation, getPublicWishes } from "@/app/dashboard/invitations/actions";
import { getGuestByToken } from "@/app/dashboard/invitations/guest-actions";

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const inv = await getPublicInvitation(slug);

  if (!inv) notFound();

  // Look up guest by token if provided
  let guestName: string | null = null;
  if (to) {
    const guest = await getGuestByToken(to);
    if (guest) {
      guestName = guest.name;
    }
  }

  const settings = inv.settings || {};
  const cover = settings.cover || {};
  const couple = settings.couple || {};
  const extra = settings.extra || {};

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      {/* ── Cover Section ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff9f1]/0 via-[#fff9f1]/30 to-[#fff9f1]" />
        {cover.coverPhotoUrl && (
          <img
            src={cover.coverPhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="relative z-10 max-w-2xl">
          {cover.coverTextTop && (
            <p className="font-serif text-lg italic tracking-wide text-[#c9a45c]">
              {cover.coverTextTop}
            </p>
          )}
          <h1 className="mt-6 font-serif text-5xl tracking-[-0.04em] md:text-7xl">
            {inv.title}
          </h1>
          {cover.title && (
            <p className="mt-4 text-lg text-[#6f5f4d]">{cover.title}</p>
          )}
          {cover.coverTextBottom && (
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-[#6f5f4d]/80">
              {cover.coverTextBottom}
            </p>
          )}
        </div>
        <div className="relative z-10 mt-12 animate-bounce">
          <svg className="h-6 w-6 text-[#c9a45c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Couple Section ── */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-[#c9a45c]">Mempelai</p>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            {/* Bride */}
            <div className="text-center">
              {couple.bridePhotoUrl && (
                <div className="mx-auto mb-6 h-56 w-56 overflow-hidden rounded-full border-2 border-[#eadcc6]">
                  <img src={couple.bridePhotoUrl} alt={couple.brideName} className="h-full w-full object-cover" />
                </div>
              )}
              <h2 className="font-serif text-3xl tracking-[-0.02em]">{couple.brideName || "Mempelai Wanita"}</h2>
              {couple.brideParents && (
                <p className="mt-2 text-sm leading-relaxed text-[#6f5f4d]">{couple.brideParents}</p>
              )}
            </div>
            {/* Groom */}
            <div className="text-center">
              {couple.groomPhotoUrl && (
                <div className="mx-auto mb-6 h-56 w-56 overflow-hidden rounded-full border-2 border-[#eadcc6]">
                  <img src={couple.groomPhotoUrl} alt={couple.groomName} className="h-full w-full object-cover" />
                </div>
              )}
              <h2 className="font-serif text-3xl tracking-[-0.02em]">{couple.groomName || "Mempelai Pria"}</h2>
              {couple.groomParents && (
                <p className="mt-2 text-sm leading-relaxed text-[#6f5f4d]">{couple.groomParents}</p>
              )}
            </div>
          </div>
          {couple.instagram && (
            <p className="mt-8 text-center text-sm text-[#a47b3d]">
              IG: @{couple.instagram.replace("@", "")}
            </p>
          )}
        </div>
      </section>

      {/* ── Quotes Section ── */}
      {extra.quotes?.text && (
        <section className="bg-[#2b2118] px-6 py-20 text-center text-white lg:px-10">
          <div className="mx-auto max-w-2xl">
            <p className="text-5xl font-serif italic leading-relaxed tracking-[-0.02em] text-[#c9a45c]">
              &ldquo;{extra.quotes.text}&rdquo;
            </p>
            {extra.quotes.source && (
              <p className="mt-4 text-sm text-[#a47b3d]">— {extra.quotes.source}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Events Section ── */}
      {inv.events && inv.events.length > 0 && (
        <section className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-[#c9a45c]">Acara</p>
            <div className="mt-12 grid gap-8">
              {inv.events.map((ev: any, i: number) => (
                <div key={ev.id || i} className="rounded-2xl border border-[#eadcc6] bg-white/40 p-8 text-center">
                  <h3 className="font-serif text-2xl tracking-[-0.02em]">{ev.title}</h3>
                  {ev.description && <p className="mt-2 text-sm text-[#6f5f4d]">{ev.description}</p>}
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-[#a47b3d]">
                    {ev.event_date && (
                      <span>{new Date(ev.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                    )}
                    {ev.start_time && <span>{ev.start_time.slice(0, 5)} WIB</span>}
                  </div>
                  {ev.venue_name && <p className="mt-3 text-sm font-medium">{ev.venue_name}</p>}
                  {ev.venue_address && <p className="mt-1 text-xs text-[#6f5f4d]">{ev.venue_address}</p>}
                  {ev.map_url && (
                    <a
                      href={ev.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg border border-[#c9a45c] px-5 py-2 text-xs uppercase tracking-[0.15em] text-[#c9a45c] transition-colors hover:bg-[#c9a45c] hover:text-white"
                    >
                      Lihat Peta
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery Section ── */}
      {inv.gallery && inv.gallery.length > 0 && (
        <section className="bg-[#eadcc6]/30 px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-[#c9a45c]">Galeri</p>
            <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {inv.gallery.map((g: any, i: number) => (
                <div key={g.id || i} className="mb-4 break-inside-avoid rounded-xl overflow-hidden border border-[#eadcc6] bg-white/60">
                  {g.type === "image" ? (
                    <img src={g.url} alt={g.caption || ""} className="w-full object-cover" />
                  ) : (
                    <div className="aspect-video bg-[#2b2118] flex items-center justify-center text-white/60 text-xs">Video</div>
                  )}
                  {g.caption && <p className="px-3 py-2 text-xs text-[#6f5f4d]">{g.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Story Section ── */}
      {inv.stories && inv.stories.length > 0 && (
        <section className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-[#c9a45c]">Cerita Kami</p>
            <div className="relative mt-12">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#eadcc6]" />
              <div className="space-y-12">
                {inv.stories.map((s: any, i: number) => (
                  <div key={s.id || i} className={`relative flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`w-1/2 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                      <h3 className="font-serif text-xl tracking-[-0.02em]">{s.title}</h3>
                      {s.subtitle && <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#c9a45c]">{s.subtitle}</p>}
                      {s.content && <p className="mt-2 text-sm leading-relaxed text-[#6f5f4d]">{s.content}</p>}
                    </div>
                    <div className="relative z-10 size-4 shrink-0 rounded-full border-2 border-[#c9a45c] bg-[#fff9f1]" />
                    <div className="w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── RSVP Section ── */}
      <section className="bg-[#2b2118] px-6 py-24 text-center text-white lg:px-10">
        <div className="mx-auto max-w-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c9a45c]">RSVP</p>
          <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]">Konfirmasi Kehadiran</h2>
          <p className="mt-3 text-sm text-[#a47b3d]">Mohon konfirmasi kehadiran kamu sebelum acara</p>
          <RSVPForm slug={inv.slug} invitationId={inv.id} />
        </div>
      </section>

      {/* ── Wedding Wishes Section ── */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-[#c9a45c]">Ucapan & Doa</p>
          <h2 className="mt-4 text-center font-serif text-3xl tracking-[-0.03em]">Wedding Wishes</h2>
          <WishForm slug={inv.slug} />
          <WishList invitationId={inv.id} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#eadcc6] px-6 py-8 text-center lg:px-10">
        <p className="font-serif text-lg text-[#c9a45c]">RuangJanji</p>
        <p className="mt-1 text-xs text-[#6f5f4d]">Undangan Digital</p>
      </footer>
    </main>
  );
}

// ── RSVP Form ──

function RSVPForm({ slug, invitationId }: { slug: string; invitationId: string }) {
  return (
    <form
      action={`/api/rsvp/${slug}`}
      method="POST"
      className="mt-8 space-y-4 text-left"
    >
      <input
        type="text"
        name="name"
        required
        placeholder="Nama kamu"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a45c] focus:outline-none"
      />
      <div className="flex gap-3">
        {["attending", "not_attending", "maybe"].map((status) => (
          <label key={status} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70 transition-colors has-[:checked]:border-[#c9a45c] has-[:checked]:text-[#c9a45c]">
            <input type="radio" name="attendance_status" value={status} className="accent-[#c9a45c]" />
            {status === "attending" ? "Hadir" : status === "not_attending" ? "Tidak Hadir" : "Masih Ragu"}
          </label>
        ))}
      </div>
      <input
        type="number"
        name="attendee_count"
        min={1}
        defaultValue={1}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a45c] focus:outline-none"
        placeholder="Jumlah orang"
      />
      <textarea
        name="note"
        rows={2}
        placeholder="Pesan (opsional)"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a45c] focus:outline-none"
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-[#c9a45c] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b38f3d]"
      >
        Kirim Konfirmasi
      </button>
    </form>
  );
}

// ── Wish Form ──

function WishForm({ slug }: { slug: string }) {
  return (
    <form
      action={`/api/wishes/${slug}`}
      method="POST"
      className="mt-6 space-y-3"
    >
      <input
        type="text"
        name="name"
        required
        placeholder="Nama"
        className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-4 py-2.5 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Tulis ucapan & doa..."
        className="w-full rounded-lg border border-[#eadcc6] bg-white/60 px-4 py-2.5 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#c9a45c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b38f3d]"
      >
        Kirim Ucapan
      </button>
    </form>
  );
}

// ── Wish List ──

async function WishList({ invitationId }: { invitationId: string }) {
  const wishes = await getPublicWishes(invitationId);

  if (!wishes || wishes.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      {wishes.map((w: any) => (
        <div key={w.id} className="rounded-lg border border-[#eadcc6] bg-white/40 p-4">
          <p className="text-sm font-medium">{w.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6f5f4d]">{w.message}</p>
          <p className="mt-1 text-[10px] text-[#a47b3d]">
            {new Date(w.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
      ))}
    </div>
  );
}
