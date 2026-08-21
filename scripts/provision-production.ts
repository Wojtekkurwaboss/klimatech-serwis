/**
 * provision-production.ts — tworzy PRAWDZIWE, puste konto klienta (nie demo).
 *
 * Wołany przez SOMI (leadgen/klimatech_bridge.py) dopiero gdy firma faktycznie
 * się zgodzi/zapłaci — patrz scripts/seed-tenant.ts dla wersji "demo"
 * (przykładowi klienci, wygenerowany e-mail właściciela @demo.klimatech.pl).
 * Tu jest odwrotnie:
 *   - właściciel loguje się na SWÓJ prawdziwy, firmowy e-mail (payload.email),
 *   - hasło NIGDY nie jest generowane/wysyłane przez SOMI ani przez ten
 *     skrypt — tworzymy prawdziwy token resetu Better Auth (ta sama tabela
 *     `verification`, ten sam mechanizm co /zapomnialem-hasla) i zwracamy
 *     GOTOWY link "ustaw hasło" w JSON-ie. Świadomie NIE wołamy tu
 *     auth.api.requestPasswordReset — ten wysyła mail przez Resend
 *     (src/lib/email.ts), a Resend bez zweryfikowanej domeny dostarcza
 *     WYŁĄCZNIE na adres właściciela konta Resend, więc cichcem gubiłby
 *     maila do każdej prawdziwej firmy. Link leci więc mailem z SOMI
 *     (leadgen/gmail_send.py — już działa dla dowolnego adresata).
 *   - ZERO przykładowych klientów/urządzeń — tenant startuje pusty, właściciel
 *     sam dodaje klientów i tworzy loginy technikom z poziomu panelu.
 *
 * Czyta JSON z stdin: {name, slug?, tagline?, phone?, email}. `email` jest
 * WYMAGANY (to prawdziwy adres firmy, nie wolno tu wpaść na fallback demo).
 * Drukuje DOKŁADNIE JEDNĄ linię JSON na stdout:
 *   sukces:  {"ok": true, "tenantId", "slug", "ownerEmail", "resetPasswordUrl"}
 *   konflikt slug: {"ok": false, "reason": "slug_exists"}
 *   inny błąd: {"ok": false, "reason": "error", "message": "..."}
 *
 * Użycie: echo '{"name":"Acme HVAC","email":"kontakt@acme.pl"}' | npx tsx scripts/provision-production.ts
 */
import { randomBytes } from "node:crypto";
import { db } from "../src/db/client";
import { tenants, verification } from "../src/db/schema";
import { auth } from "../src/lib/auth";

type Payload = {
  name: string;
  slug?: string;
  tagline?: string;
  phone?: string;
  email: string;
  /** Publiczny URL appki (np. https://klimatech-repo.vercel.app) — świadomie
   * NIE bierzemy tego z process.env.BETTER_AUTH_URL, bo lokalne .env.local
   * (użyte tu przez `dotenv -e .env.local`) wskazuje na localhost, a ten link
   * leci mailem do prawdziwego klienta, który localhosta nie otworzy. */
  publicBaseUrl: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Hasło startowe nigdy nie opuszcza tego procesu — Better Auth wymaga jakiegoś
// przy tworzeniu konta, ale właściciel i tak dostanie mailem link do
// ustawienia WŁASNEGO (patrz forgetPassword poniżej).
function throwawayPassword(): string {
  return randomBytes(24).toString("base64url");
}

async function readStdin(): Promise<Payload> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

async function main() {
  const payload = await readStdin();
  if (!payload.name || !payload.name.trim()) {
    throw new Error("payload.name is required");
  }
  if (!payload.email || !payload.email.trim()) {
    throw new Error("payload.email is required (prawdziwy e-mail firmy — to NIE jest tenant demo)");
  }
  if (!payload.publicBaseUrl || !payload.publicBaseUrl.trim()) {
    throw new Error("payload.publicBaseUrl is required");
  }

  const baseSlug = payload.slug?.trim() || slugify(payload.name);
  const slug = baseSlug || `firma-${Date.now()}`;

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: payload.name,
      slug,
      tagline: payload.tagline || "Panel Klienta",
      logoUrl: "/logo-klimatech.svg",
      phone: payload.phone || null,
      email: payload.email,
    })
    .onConflictDoNothing({ target: tenants.slug })
    .returning();

  if (!tenant) {
    console.log(JSON.stringify({ ok: false, reason: "slug_exists" }));
    return;
  }

  const ownerEmail = payload.email.trim();
  const ownerSignUp = await auth.api.signUpEmail({
    body: {
      email: ownerEmail,
      password: throwawayPassword(),
      name: `Właściciel ${payload.name}`,
      role: "owner",
      tenantId: tenant.id,
      firstName: "Właściciel",
      lastName: payload.name,
    },
  });

  // Prawdziwy token resetu hasła Better Auth (tabela `verification`, ten sam
  // format co auth.api.requestPasswordReset) — ale link WYSYŁA SOMI przez
  // Gmail, nie Resend (patrz komentarz na górze pliku).
  const resetToken = randomBytes(24).toString("base64url");
  await db.insert(verification).values({
    id: randomBytes(12).toString("base64url"),
    identifier: `reset-password:${resetToken}`,
    value: ownerSignUp.user.id,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  });
  const resetPasswordUrl = `${payload.publicBaseUrl.replace(/\/$/, "")}/reset-hasla?token=${resetToken}`;

  console.log(
    JSON.stringify({
      ok: true,
      tenantId: tenant.id,
      slug: tenant.slug,
      ownerEmail,
      resetPasswordUrl,
    }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(JSON.stringify({ ok: false, reason: "error", message: String(err?.message || err) }));
    process.exit(1);
  });
