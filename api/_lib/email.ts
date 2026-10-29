// Emails to Dyllan (inquiries, ticket and gift certificate sales) go out through
// Resend from the already-verified schottky.com domain (Dyllan's own domain isn't
// set up for sending yet). Reply-To is the guest, so Dyllan can just hit reply.
// NOTIFY_BCC gets a blind copy of each one, so the developer can keep an eye on them.
export async function emailDyllan(opts: { subject: string; text: string; replyTo?: string | null; idempotencyKey: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const to = process.env.INQUIRY_TO || "dyllan@wildfoodsbydyllan.com";
  const from = process.env.INQUIRY_FROM || "Wild Foods website <wildfoods@schottky.com>";
  const bcc = process.env.NOTIFY_BCC?.trim();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": opts.idempotencyKey },
    body: JSON.stringify({
      from,
      to: [to],
      bcc: bcc ? [bcc] : undefined,
      reply_to: opts.replyTo || undefined,
      subject: opts.subject,
      text: opts.text,
    }),
  });
  return res.ok;
}
