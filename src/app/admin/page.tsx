import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

type CountRow = { count: string };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [users, templates, invitations] = await Promise.all([
    query<CountRow>("select count(*)::text as count from users"),
    query<CountRow>("select count(*)::text as count from templates"),
    query<CountRow>("select count(*)::text as count from invitations"),
  ]);

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <header className="border-b border-[#eadcc6] bg-white/55 px-6 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl">RuangJanji Admin</Link>
          <div className="flex items-center gap-4 text-sm text-[#6f5f4d]">
            <Link href="/dashboard" className="hover:text-[#2b2118]">Dashboard</Link>
            <form action={logoutAction}><button className="hover:text-[#2b2118]">Keluar</button></form>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
        <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Admin</p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-0.04em]">Kelola user dan template.</h1>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Users", users.rows[0].count, "/admin/users"],
            ["Templates", templates.rows[0].count, "/admin/templates"],
            ["Invitations", invitations.rows[0].count, "/dashboard"],
          ].map(([label, value, href]) => (
            <Link key={label} href={href} className="rounded-[1.5rem] border border-[#eadcc6] bg-white/65 p-6 transition hover:-translate-y-1">
              <p className="text-sm text-[#8d7350]">{label}</p>
              <p className="mt-3 font-serif text-5xl">{value}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
