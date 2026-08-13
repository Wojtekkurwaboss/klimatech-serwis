import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";

const registerSchema = z.object({
  companyName: z.string().min(2, "Podaj nazwę firmy"),
  firstName: z.string().min(1, "Podaj imię"),
  lastName: z.string().min(1, "Podaj nazwisko"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export const registerCompany = createServerFn({ method: "POST" })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: data.companyName,
        slug: slugify(data.companyName),
        email: data.email,
      })
      .returning();

    try {
      await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          role: "owner",
          tenantId: tenant.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    } catch (err) {
      // Signup failed (e.g. email already taken) — remove the orphaned tenant row
      // since Better Auth's own insert isn't part of this Drizzle transaction.
      await db.delete(tenants).where(eq(tenants.id, tenant.id));
      throw err;
    }

    return { tenantId: tenant.id };
  });
