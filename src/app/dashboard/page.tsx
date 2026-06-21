import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { getUserInvitations } from "./invitations/actions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invitations = await getUserInvitations();

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
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Dashboard</p>
            <h1 className="mt-2 font-serif text-5xl tracking-[-0.04em]">Halo, {user.name || user.email}</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#6f5f4d]">
              Kelola undangan digital kamu di sini. Buat undangan baru, edit, atau lihat statistik.
            </p>
          </div>
          <Link
            href="/dashboard/invitations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c9a45c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b38f3d]"
          >
            + Buat Undangan Baru
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#eadcc6] bg-white/40 p-6">
            <p className="text-3xl font-semibold">{invitations.length}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a47b3d]">Total Undangan</p>
          </div>
          <div className="rounded-xl border border-[#eadcc6] bg-white/40 p-6">
            <p className="text-3xl font-semibold">{invitations.filter((i) => i.status === "published").length}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a47b3d]">Published</p>
          </div>
          <div className="rounded-xl border border-[#eadcc6] bg-white/40 p-6">
            <p className="text-3xl font-semibold">{invitations.filter((i) => i.status === "draft").length}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a47b3d]">Draft</p>
          </div>
        </div>

        {/* Invitation List */}
        <div className="mt-12">
          <h2 className="font-serif text-3xl tracking-[-0.03em]">Undangan Kamu</h2>

          {invitations.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-[#eadcc6] p-12 text-center">
              <p className="text-sm text-[#6f5f4d]">Belum ada undangan. Klik &quot;Buat Undangan Baru&quot; untuk mulai!</p>
            </div>
          )}

          <div className="mt-6 grid gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-[#eadcc6] bg-white/40 p-5 transition-colors hover:border-[#c9a45c]/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate font-serif text-lg">{inv.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                      inv.status === "published"
                        ? "bg-green-50 text-green-700"
                        : inv.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-50 text-gray-600"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6f5f4d]">
                    rj.my.id/undangan/{inv.slug} &middot; Dibuat {new Date(inv.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  {inv.status === "published" && (
                    <Link
                      href={`/undangan/${inv.slug}`}
                      target="_blank"
                      className="rounded-lg border border-[#eadcc6] px-3 py-1.5 text-xs text-[#6f5f4d] transition-colors hover:border-[#c9a45c] hover:text-[#c9a45c]"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/invitations/${inv.id}/edit`}
                    className="rounded-lg bg-[#2b2118] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#c9a45c]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
