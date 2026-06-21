import Link from "next/link";
import { signupAction } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff9f1] px-6 py-12 text-[#2b2118] sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          RuangJanji
        </Link>

        <div className="mt-16">
          <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Mulai</p>
          <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.04em]">
            Buat akun pertama
          </h1>
          <p className="mt-5 leading-7 text-[#6f5f4d]">
            Simpan undangan, atur tamu, dan kelola RSVP dari dashboard.
          </p>
        </div>

        {params.error === "email_used" ? (
          <div className="mt-8 rounded-2xl border border-[#d9a6a0] bg-[#fff3f1] px-4 py-3 text-sm text-[#7a3e35]">
            Email sudah terdaftar.
          </div>
        ) : null}
        {params.error === "invalid" ? (
          <div className="mt-8 rounded-2xl border border-[#d9a6a0] bg-[#fff3f1] px-4 py-3 text-sm text-[#7a3e35]">
            Nama, email, dan password minimal 8 karakter wajib diisi.
          </div>
        ) : null}

        <form action={signupAction} className="mt-10 space-y-5">
          <label className="block">
            <span className="text-sm text-[#6f5f4d]">Nama</span>
            <input
              name="name"
              type="text"
              required
              placeholder="Nama kamu"
              className="mt-2 w-full rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3.5 outline-none transition placeholder:text-[#b9a993] focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/15"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#6f5f4d]">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              className="mt-2 w-full rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3.5 outline-none transition placeholder:text-[#b9a993] focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/15"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#6f5f4d]">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="mt-2 w-full rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3.5 outline-none transition placeholder:text-[#b9a993] focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/15"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-[#2b2118] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3a2c21]"
          >
            Daftar
          </button>
        </form>

        <div className="mt-7 flex items-center gap-3 text-sm text-[#6f5f4d]">
          <span>Sudah punya akun?</span>
          <Link href="/login" className="font-medium text-[#8d6b35] transition hover:text-[#2b2118]">
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
