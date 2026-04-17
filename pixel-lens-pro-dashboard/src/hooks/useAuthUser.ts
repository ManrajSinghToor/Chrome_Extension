import { useEffect, useState } from "react";
import { type AuthUser, getAuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getAuthUser();
  });

  useEffect(() => {
    const onStorage = () => setUser(getAuthUser());
    window.addEventListener("storage", onStorage);
    const onFocus = () => setUser(getAuthUser());
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { user, refresh: () => setUser(getAuthUser()) };
}
