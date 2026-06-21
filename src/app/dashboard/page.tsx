import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

type InvitationSummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invitations = await query<InvitationSummary>(
    `select id, title, slug, status, created_at
     from invitations
     where user_id = $1
     order by created_at desc
     limit 6`,
    [user.id],
  );

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <header className="border-b border-[#eadcc6] bg-white/55 px-6 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl">RuangJanji</Link>
          <div className="flex items-center gap-4 text-sm text-[#6f5f4d]">
            {user.role === "admin" ? <Link href="/admin" className="hover:text-[#2b2118]">Admin</Link> : null}
            <form action={logoutAction}>
              <button className="hover:text-[#2b2118]">Keluar</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
        <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Dashboard</p>
        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.04em]">Halo, {user.name || user.email}</h1>
            <p className="mt-4 max-w-xl leading-7 text-[#6f5f4d]">
              Kelola undangan, tamu, RSVP, galeri, dan ucapan dari satu tempat.
            </p>
          </div>
          <button className="rounded-full bg-[#2b2118] px-6 py-3 text-sm font-medium text-white">
            Buat undangan
          </button>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Undangan", invitations.rows.length.toString()],
            ["Status", "MVP"],
            ["Role", user.role],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-[#eadcc6] bg-white/65 p-6">
              <p className="text-sm text-[#8d7350]">{label}</p>
              <p className="mt-3 font-serif text-4xl">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-[2rem] border border-[#eadcc6] bg-white/65 p-6">
          <h2 className="font-serif text-3xl">Undangan terbaru</h2>
          <div className="mt-6 divide-y divide-[#eadcc6]">
            {invitations.rows.length === 0 ? (
              <p className="py-8 text-[#6f5f4d]">Belum ada undangan. Nanti form create invitation masuk di sini.</p>
            ) : (
              invitations.rows.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{invitation.title}</p>
                    <p className="text-sm text-[#6f5f4d]">/{invitation.slug}</p>
                  </div>
                  <span className="rounded-full border border-[#dfcfb8] px-3 py-1 text-xs text-[#8d7350]">
                    {invitation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
