import Link from "next/link";
import { loginAction } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              RuangJanji
            </Link>
            <div className="mt-16">
              <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Dashboard</p>
              <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.04em]">
                Masuk ke Dashboard
              </h1>
              <p className="mt-5 leading-7 text-[#6f5f4d]">
                Kelola undangan digitalmu dengan mudah.
              </p>
            </div>

            {params.error === "invalid" ? (
              <div className="mt-8 rounded-2xl border border-[#d9a6a0] bg-[#fff3f1] px-4 py-3 text-sm text-[#7a3e35]">
                Email atau password belum cocok.
              </div>
            ) : null}

            <form action={loginAction} className="mt-10 space-y-5">
              <label className="block">
                <span className="text-sm text-[#6f5f4d]">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="mt-2 w-full rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3.5 text-[#2b2118] outline-none transition placeholder:text-[#b9a993] focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/15"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6f5f4d]">Password</span>
                  <a href="#" className="text-sm text-[#8d6b35] transition hover:text-[#2b2118]">
                    Lupa password?
                  </a>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-[#dfcfb8] bg-white px-4 py-3.5 text-[#2b2118] outline-none transition placeholder:text-[#b9a993] focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/15"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-[#2b2118] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3a2c21]"
              >
                Masuk
              </button>
            </form>

            <div className="mt-7 flex items-center gap-3 text-sm text-[#6f5f4d]">
              <span>Belum punya akun?</span>
              <Link href="/signup" className="font-medium text-[#8d6b35] transition hover:text-[#2b2118]">
                Daftar
              </Link>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#f4eadb] p-10 lg:block">
          <div className="absolute left-12 top-20 h-72 w-72 rounded-full bg-[#d9a6a0]/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#c9a45c]/20 blur-3xl" />
          <div className="relative flex h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-[2.25rem] border border-[#dfcfb8] bg-white/70 p-5 shadow-2xl shadow-[#5b3c1e]/10 backdrop-blur">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-[#fff9f1] p-8">
                <div className="absolute inset-0 bg-[url('/landing-ornament.svg')] bg-cover bg-center opacity-45" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#9d8053]">The wedding of</p>
                  <h2 className="mt-16 font-serif text-6xl leading-none tracking-[-0.04em]">
                    Raka &amp; Sinta
                  </h2>
                  <p className="mt-5 text-[#6f5f4d]">12 Desember 2026</p>
                </div>
                <div className="relative mt-12 grid grid-cols-3 gap-3 text-center text-sm text-[#6f5f4d]">
                  {["RSVP", "Galeri", "Wishes"].map((item) => (
                    <div key={item} className="rounded-2xl border border-[#eadcc6] bg-white px-3 py-4">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
