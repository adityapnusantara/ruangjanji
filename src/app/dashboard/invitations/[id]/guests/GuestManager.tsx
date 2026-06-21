"use client";

import { useState, useRef } from "react";
import { addGuest, addMultipleGuests, deleteGuest, markAsSent } from "../../guest-actions";

type GuestWithLinks = {
  id: string;
  invitation_id: string;
  name: string;
  phone: string | null;
  group_name: string | null;
  token: string;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
  waLink: string | null;
  inviteUrl: string;
};

export default function GuestManager({
  invitationId,
  slug,
  initialGuests,
}: {
  invitationId: string;
  slug: string;
  initialGuests: GuestWithLinks[];
}) {
  const [guests, setGuests] = useState<GuestWithLinks[]>(initialGuests);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.phone && g.phone.includes(search)),
  );

  const handleAddSingle = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addGuest(invitationId, { name: name.trim(), phone: phone.trim() || undefined, group_name: group.trim() || undefined });
    setName("");
    setPhone("");
    setGroup("");
    setShowAddForm(false);
    setSaving(false);
    // Refresh
    window.location.reload();
  };

  const handleBulk = async () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    const guests = lines.map((line) => {
      // Format: Nama | Phone | Group
      const parts = line.split("|").map((p) => p.trim());
      return { name: parts[0], phone: parts[1] || undefined, group_name: parts[2] || undefined };
    });
    if (guests.length === 0) return;
    setSaving(true);
    await addMultipleGuests(invitationId, guests);
    setBulkText("");
    setShowBulk(false);
    setSaving(false);
    window.location.reload();
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    await deleteGuest(invitationId, guestId);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleMarkSent = async (guestId: string) => {
    await markAsSent(invitationId, guestId);
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, sent_at: new Date().toISOString() } : g)),
    );
  };

  const handleExport = () => {
    const csv = [
      ["Nama", "Phone", "Group", "Sent", "Opened", "Link"].join(","),
      ...guests.map((g) =>
        [
          `"${g.name}"`,
          g.phone || "",
          g.group_name || "",
          g.sent_at ? "Yes" : "No",
          g.opened_at ? "Yes" : "No",
          g.inviteUrl,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tamu-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-lg border border-[#eadcc6] bg-white/60 px-3 py-2 text-sm text-[#2b2118] placeholder:text-[#a47b3d]/50 focus:border-[#c9a45c] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowBulk(false); }}
            className="rounded-lg bg-[#2b2118] px-4 py-2 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#c9a45c]"
          >
            + Tamu
          </button>
          <button
            onClick={() => { setShowBulk(!showBulk); setShowAddForm(false); }}
            className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#6f5f4d] transition-colors hover:border-[#c9a45c]"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg border border-[#eadcc6] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#6f5f4d] transition-colors hover:border-[#c9a45c]"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Add Single Form */}
      {showAddForm && (
        <div className="mt-4 rounded-xl border border-[#eadcc6] bg-white/60 p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nama tamu" className="rounded-lg border border-[#eadcc6] bg-white px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none" />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="No. WA (08xxx)" className="rounded-lg border border-[#eadcc6] bg-white px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none" />
            <input type="text" value={group} onChange={(e) => setGroup(e.target.value)}
              placeholder="Group (opsional)" className="rounded-lg border border-[#eadcc6] bg-white px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none" />
            <button onClick={handleAddSingle} disabled={saving || !name.trim()}
              className="rounded-lg bg-[#c9a45c] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? "..." : "Tambah"}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Import */}
      {showBulk && (
        <div className="mt-4 rounded-xl border border-[#eadcc6] bg-white/60 p-5">
          <p className="mb-2 text-xs text-[#6f5f4d]">
            Satu baris per tamu. Format: <code className="text-[#c9a45c]">Nama | Phone | Group</code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder="Budi Santoso | 08123456789 | Keluarga&#10;Siti Aisyah | 08987654321 | Teman"
            className="w-full rounded-lg border border-[#eadcc6] bg-white px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
          />
          <button onClick={handleBulk} disabled={saving || !bulkText.trim()}
            className="mt-3 rounded-lg bg-[#c9a45c] px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
            {saving ? "..." : "Import Semua"}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="rounded-lg border border-[#eadcc6] bg-white/40 p-3">
          <p className="text-lg font-semibold">{guests.length}</p>
          <p className="text-xs text-[#6f5f4d]">Total</p>
        </div>
        <div className="rounded-lg border border-[#eadcc6] bg-white/40 p-3">
          <p className="text-lg font-semibold">{guests.filter((g) => g.sent_at).length}</p>
          <p className="text-xs text-[#6f5f4d]">Terkirim</p>
        </div>
        <div className="rounded-lg border border-[#eadcc6] bg-white/40 p-3">
          <p className="text-lg font-semibold">{guests.filter((g) => g.opened_at).length}</p>
          <p className="text-xs text-[#6f5f4d]">Dibuka</p>
        </div>
      </div>

      {/* Guest Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#eadcc6] bg-white/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eadcc6] text-left text-xs uppercase tracking-[0.15em] text-[#a47b3d]">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">No. WA</th>
              <th className="px-4 py-3 font-medium">Group</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6f5f4d]">
                  {search ? "Tidak ada tamu yang cocok." : "Belum ada tamu."}
                </td>
              </tr>
            )}
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-[#eadcc6]/50 last:border-0 hover:bg-white/40">
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3 text-[#6f5f4d]">{g.phone || "-"}</td>
                <td className="px-4 py-3 text-[#6f5f4d]">{g.group_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-[11px] ${
                    g.opened_at ? "text-green-600" : g.sent_at ? "text-amber-600" : "text-gray-400"
                  }`}>
                    <span className={`inline-block size-1.5 rounded-full ${
                      g.opened_at ? "bg-green-500" : g.sent_at ? "bg-amber-400" : "bg-gray-300"
                    }`} />
                    {g.opened_at ? "Dibuka" : g.sent_at ? "Terkirim" : "Belum"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {g.inviteUrl && (
                    <button
                      onClick={() => navigator.clipboard.writeText(g.inviteUrl)}
                      className="mr-2 rounded bg-[#eadcc6] px-2 py-0.5 text-[10px] text-[#6f5f4d] transition-colors hover:bg-[#c9a45c] hover:text-white"
                    >
                      Copy Link
                    </button>
                  )}
                  {g.waLink && (
                    <a
                      href={g.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkSent(g.id)}
                      className="rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-700 transition-colors hover:bg-green-200"
                    >
                      WA
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
