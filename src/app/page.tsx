import Link from "next/link";

const features = [
  {
    title: "Tamu tertata",
    text: "Buat daftar tamu, siapkan link personal, lalu kirim lewat WhatsApp tanpa spreadsheet berantakan.",
  },
  {
    title: "RSVP yang jelas",
    text: "Pantau siapa yang hadir, jumlah pendamping, dan catatan tamu dari satu dashboard ringkas.",
  },
  {
    title: "Cerita tersimpan",
    text: "Galeri, ucapan, musik, dan timeline hadir dalam halaman undangan yang terasa personal.",
  },
];

const templates = ["Classic Gold", "Minimal Ivory", "Romantic Rose"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="font-serif text-2xl tracking-tight">
          RuangJanji
        </a>
        <div className="hidden items-center gap-8 text-sm text-[#6f5f4d] md:flex">
          <a href="#fitur" className="transition hover:text-[#2b2118]">
            Fitur
          </a>
          <a href="#template" className="transition hover:text-[#2b2118]">
            Template
          </a>
          <a href="#faq" className="transition hover:text-[#2b2118]">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="hidden text-[#6f5f4d] transition hover:text-[#2b2118] sm:inline">
            Login
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#c9a45c]/50 bg-[#2b2118] px-5 py-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3a2c21]"
          >
            Buat undangan
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 pb-20 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-28 lg:pt-16">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-[#eadcc6] bg-white/70 px-4 py-2 text-sm text-[#7a6041] shadow-sm">
            Untuk undangan yang rapi, tenang, dan personal.
          </p>
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#241a12] sm:text-6xl lg:text-7xl">
            Undangan digital yang terasa personal, bukan template massal.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#6f5f4d]">
            Buat halaman undangan, atur tamu, kumpulkan RSVP, dan simpan ucapan dalam satu dashboard yang rapi.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-[#2b2118] px-7 py-3.5 text-center text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3a2c21]"
            >
              Buat undangan pertama
            </Link>
            <a
              href="#template"
              className="rounded-full border border-[#d9c7ad] bg-white/60 px-7 py-3.5 text-center text-sm font-medium text-[#2b2118] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Lihat contoh
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-10 rounded-[3rem] bg-[url('/landing-ornament.svg')] bg-cover bg-center opacity-80" />
          <div className="absolute -left-8 top-16 h-56 w-56 rounded-full bg-[#d9a6a0]/25 blur-3xl" />
          <div className="absolute -right-8 bottom-10 h-64 w-64 rounded-full bg-[#c9a45c]/20 blur-3xl" />
          <div className="relative rounded-[2rem] border border-[#eadcc6] bg-white/75 p-4 shadow-2xl shadow-[#5b3c1e]/10 backdrop-blur">
            <div className="rounded-[1.5rem] bg-[#f7efe3] p-5">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-[#fffaf4] shadow-xl shadow-[#8b6b45]/10">
                <div className="relative h-80 overflow-hidden bg-[linear-gradient(140deg,#f3e1ce,#fffaf4_45%,#d9a6a0)] p-8">
                  <div className="absolute inset-0 bg-[url('/landing-ornament.svg')] bg-cover bg-center opacity-45" />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#8d7350]">The wedding of</p>
                    <h2 className="mt-9 font-serif text-6xl leading-none tracking-[-0.05em] text-[#2b2118]">
                      Raka &amp; Sinta
                    </h2>
                    <p className="mt-5 text-sm text-[#6f5f4d]">Sabtu, 12 Desember 2026</p>
                  </div>
                  <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-[#c9a45c]/45 bg-white/35 backdrop-blur-sm" />
                </div>
                <div className="grid gap-4 p-6 sm:grid-cols-3">
                  {[
                    ["RSVP", "128 hadir"],
                    ["Tamu", "324 nama"],
                    ["Ucapan", "48 pesan"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-[#eadcc6] bg-white p-4">
                      <p className="text-xs text-[#8d7350]">{label}</p>
                      <p className="mt-2 font-serif text-2xl">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Fitur inti</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">
            Cukup yang penting. Tidak lebih.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[1.75rem] border border-[#eadcc6] bg-white/65 p-7 shadow-sm">
              <h3 className="font-serif text-2xl">{feature.title}</h3>
              <p className="mt-4 leading-7 text-[#6f5f4d]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="template" className="bg-[#f4eadb] py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Template awal</p>
              <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">
                Pilih rasa, bukan sekadar warna.
              </h2>
            </div>
            <p className="max-w-md leading-7 text-[#6f5f4d]">
              Tiga arah visual pertama dibuat sebagai pondasi. Setiap template tetap bisa diisi data, galeri, cerita, dan RSVP yang sama.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {templates.map((template, index) => (
              <article key={template} className="group rounded-[2rem] border border-[#dfcfb8] bg-[#fffaf4] p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6b4a27]/10">
                <div className="h-72 rounded-[1.5rem] bg-white p-6">
                  <div className={`h-full rounded-[1.2rem] border ${index === 2 ? "border-[#d9a6a0] bg-[#fff3f1]" : "border-[#eadcc6] bg-[#fff9f1]"} p-6`}>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#9d8053]">Preview</p>
                    <h3 className="mt-16 font-serif text-4xl leading-none">Ayu & Nara</h3>
                    <div className="mt-8 h-px w-20 bg-[#c9a45c]" />
                    <p className="mt-5 text-sm text-[#6f5f4d]">Minggu, 24 Mei 2026</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 pb-2 pt-5">
                  <h3 className="font-serif text-2xl">{template}</h3>
                  <span className="text-sm text-[#8d7350]">Preview</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Cara kerja</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Dari draft ke link siap kirim.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Pilih template",
            "Isi data acara",
            "Preview halaman",
            "Bagikan link",
          ].map((step, index) => (
            <div key={step} className="rounded-3xl border border-[#eadcc6] bg-white/65 p-6">
              <span className="text-sm text-[#a47b3d]">0{index + 1}</span>
              <p className="mt-5 font-serif text-2xl">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-4xl px-6 py-20 lg:px-10">
        <h2 className="font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Pertanyaan awal</h2>
        <div className="mt-10 divide-y divide-[#eadcc6] rounded-[2rem] border border-[#eadcc6] bg-white/65 px-7">
          {[
            ["Bisa kirim WhatsApp?", "Bisa. MVP memakai link manual wa.me dulu, jadi tidak perlu biaya API."],
            ["Bisa RSVP?", "Bisa. Tamu bisa konfirmasi hadir dan jumlah orang yang datang."],
            ["Bisa pakai musik dan galeri?", "Bisa. Musik, foto, video embed, dan ucapan tamu masuk scope MVP."],
          ].map(([question, answer]) => (
            <div key={question} className="py-6">
              <h3 className="font-serif text-2xl">{question}</h3>
              <p className="mt-2 leading-7 text-[#6f5f4d]">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#eadcc6] px-6 py-10 text-sm text-[#6f5f4d] lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-4 sm:flex-row">
          <p className="font-serif text-xl text-[#2b2118]">TemuJanji</p>
          <p>Undangan digital yang rapi dan personal.</p>
        </div>
      </footer>
    </main>
  );
}
