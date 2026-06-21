import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInvitation } from "../../actions";
import InvitationEditor from "../../InvitationEditor";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const data = await getInvitation(id);
  if (!data) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#fff9f1] text-[#2b2118]">
      <header className="border-b border-[#eadcc6] bg-white/55 px-6 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <a href="/dashboard" className="font-serif text-2xl">RuangJanji</a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
        <p className="mb-2 text-sm uppercase tracking-[0.28em] text-[#a47b3d]">Edit Undangan</p>
        <InvitationEditor initialData={data} />
      </section>
    </main>
  );
}
