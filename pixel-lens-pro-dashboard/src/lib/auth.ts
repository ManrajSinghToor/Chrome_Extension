export type AuthUser = {
  name: string;
  email: string;
};

const KEY = "pixellens_auth_user";

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed?.name || !parsed?.email) return null;
    return { name: parsed.name, email: parsed.email };
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(KEY);
}
