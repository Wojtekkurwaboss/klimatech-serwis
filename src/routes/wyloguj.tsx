import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/wyloguj")({
  component: WylogujPage,
});

function WylogujPage() {
  const navigate = useNavigate();

  useEffect(() => {
    authClient.signOut().finally(() => navigate({ to: "/logowanie" }));
  }, [navigate]);

  return null;
}
