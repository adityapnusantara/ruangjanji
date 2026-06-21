import Link from "next/link";
import { redirect } from "next/navigation";
import { createTemplateAction, toggleTemplateAction } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

type TemplateRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
};

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "admin") redirect("/dashboard");

  const templates = await query<TemplateRow>(
    `select id, code, name, description, category, is_active, is_premium, sort_order
     from templates
     order by sort_order asc, created_at desc`,
  );

  return (
    <main className="min-h-screen bg-[#fff9f1] px-6 py-10 text-[#2b2118] lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/admin" className="text-sm text-[#8d7350]">← Admin</Link>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.04em]">Templates</h1>
            <p className="mt-3 text-[#6f5f4d]">Kelola template yang tampil untuk user.</p>
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#eadcc6] bg-white/65 p-6">
          <h2 className="font-serif text-3xl">Tambah template</h2>
          {params.error === "invalid" ? <p className="mt-3 text-sm text-[#7a3e35]">Code dan name wajib diisi.</p> : null}
          <form action={createTemplateAction} className="mt-6 grid gap-4 md:grid-cols-4">
            <input name="code" placeholder="classic_gold" className="rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3 outline-none" />
            <input name="name" placeholder="Classic Gold" className="rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3 outline-none" />
            <input name="category" placeholder="wedding" className="rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3 outline-none" />
            <button className="rounded-full bg-[#2b2118] px-5 py-3 text-sm text-white">Tambah</button>
            <textarea name="description" placeholder="Deskripsi singkat" className="rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3 outline-none md:col-span-4" />
          </form>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {templates.rows.map((template) => (
            <article key={template.id} className="rounded-[1.75rem] border border-[#eadcc6] bg-white/65 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#a47b3d]">{template.code}</p>
                  <h2 className="mt-3 font-serif text-3xl">{template.name}</h2>
                </div>
                <span className="rounded-full border border-[#dfcfb8] px-3 py-1 text-xs text-[#8d7350]">
                  {template.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="mt-4 min-h-14 text-sm leading-6 text-[#6f5f4d]">{template.description || "Belum ada deskripsi."}</p>
              <form action={toggleTemplateAction} className="mt-6">
                <input type="hidden" name="templateId" value={template.id} />
                <input type="hidden" name="isActive" value={String(template.is_active)} />
                <button className="rounded-full border border-[#dfcfb8] px-4 py-2 text-sm">
                  {template.is_active ? "Sembunyikan" : "Aktifkan"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
