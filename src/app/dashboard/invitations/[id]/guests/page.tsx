import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGuests } from "../../guest-actions";
import { getInvitationSlug } from "../../guest-actions";
import { buildWhatsAppLink } from "../../guest-utils";
import { getInvitation } from "../../actions";
import GuestManager from "./GuestManager";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const slug = await getInvitationSlug(id);
  if (!slug) redirect("/dashboard");

  const invitation = await getInvitation(id);
  if (!invitation) redirect("/dashboard");

  const guests = await getGuests(id);

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <header className="border-b border-[#eadcc6] bg-white/55 px-6 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <a href="/dashboard" className="font-serif text-2xl">RuangJanji</a>
          <a href={`/dashboard/invitations/${id}/edit`} className="text-sm text-[#6f5f4d] hover:text-[#2b2118]">
            &larr; Kembali ke Editor
          </a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
        <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Kelola Tamu</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.03em]">{invitation.title}</h1>

        <GuestManager
          invitationId={id}
          slug={slug}
          initialGuests={guests.map((g) => ({
            ...g,
            waLink: g.phone
              ? buildWhatsAppLink(g.phone, g.name, slug, g.token)
              : null,
            inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://43.133.153.131:3000"}/undangan/${slug}?to=${g.token}`,
          }))}
        />
      </section>
    </main>
  );
}
