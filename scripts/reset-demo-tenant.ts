import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { tenants, users, clients, devices, serviceEntries, visits, documents, session, account } from "../src/db/schema";

async function resetDemoTenant() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, "klimatech-demo")).limit(1);
  if (!tenant) {
    console.log("No existing klimatech-demo tenant found — nothing to reset.");
    return;
  }

  const tenantUsers = await db.select({ id: users.id }).from(users).where(eq(users.tenantId, tenant.id));
  const userIds = tenantUsers.map((u) => u.id);

  await db.delete(documents).where(eq(documents.tenantId, tenant.id));
  await db.delete(serviceEntries).where(eq(serviceEntries.tenantId, tenant.id));
  await db.delete(visits).where(eq(visits.tenantId, tenant.id));
  await db.delete(devices).where(eq(devices.tenantId, tenant.id));
  await db.delete(clients).where(eq(clients.tenantId, tenant.id));
  for (const id of userIds) {
    await db.delete(session).where(eq(session.userId, id));
    await db.delete(account).where(eq(account.userId, id));
  }
  await db.delete(users).where(eq(users.tenantId, tenant.id));
  await db.delete(tenants).where(eq(tenants.id, tenant.id));

  console.log(`Deleted demo tenant "${tenant.slug}" (${tenant.id}) and ${userIds.length} users. Re-run npm run db:seed.`);
}

resetDemoTenant()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
