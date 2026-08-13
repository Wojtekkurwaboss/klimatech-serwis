import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "KlimaTech Serwis <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    // RESEND_API_KEY not set yet — log instead of failing signup/login flows.
    console.log(`[email:dev-fallback] to=${to} subject="${subject}"\n${html}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}
