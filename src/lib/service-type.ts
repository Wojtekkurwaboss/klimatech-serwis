import type { ServiceType } from "@/config/tenant";

export type DbServiceType = "montaz" | "przeglad" | "naprawa" | "uzupelnienie_czynnika";

export const dbToDisplayServiceType: Record<DbServiceType, ServiceType> = {
  montaz: "montaż",
  przeglad: "przegląd",
  naprawa: "naprawa",
  uzupelnienie_czynnika: "uzupełnienie czynnika",
};

export const displayToDbServiceType: Record<ServiceType, DbServiceType> = {
  montaż: "montaz",
  przegląd: "przeglad",
  naprawa: "naprawa",
  "uzupełnienie czynnika": "uzupelnienie_czynnika",
};
