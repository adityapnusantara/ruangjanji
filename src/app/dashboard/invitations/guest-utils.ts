import crypto from "node:crypto";

export function generateToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function buildWhatsAppLink(phone: string, name: string, slug: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://43.133.153.131:3000";
  const inviteUrl = `${baseUrl}/undangan/${slug}?to=${token}`;

  const message = `Kepada Yth.\n${name}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan kami.\n\n${inviteUrl}\n\nMerupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu.\n\nTerima kasih.`;

  return `https://wa.me/${phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}
