import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/start-server-core";
import { redirect } from "@tanstack/react-router";
import { auth, type Role } from "./auth";

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers: headers as unknown as Headers });
  return session;
});

export function roleHomeRoute(role: Role): string {
  switch (role) {
    case "owner":
      return "/wlasciciel";
    case "technician":
      return "/technik";
    case "client":
    default:
      return "/";
  }
}

export type SessionUser = { id: string; role: Role; tenantId: string; firstName: string; lastName: string };

/** For use inside server functions (data-layer authorization) — throws a plain Error instead of redirecting. */
export async function requireSessionUser(role: Role) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");
  const user = session.user as unknown as SessionUser;
  if (user.role !== role) throw new Error("Forbidden");
  return { ...session, user };
}

export async function requireRole(role: Role) {
  const session = await getCurrentSession();
  if (!session) {
    throw redirect({ to: "/logowanie" });
  }
  if ((session.user as { role: Role }).role !== role) {
    throw redirect({ to: roleHomeRoute((session.user as { role: Role }).role) });
  }
  return session;
}
