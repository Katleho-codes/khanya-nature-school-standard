import type { ApiErrorBody, Role } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4002";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  isActive: boolean;
}

export class AdminApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new AdminApiError(
      response.status,
      body?.error?.code ?? "REQUEST_FAILED",
      body?.error?.message ?? "That action could not be completed.",
      body?.error?.fields,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const { headers } = await import("next/headers");
  const incoming = await headers();
  const cookie = incoming.get("cookie");
  if (!cookie) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      user?: SessionUser;
    } | null;
    if (!data?.user) return null;
    if (!data.user.isActive) return null;
    return data.user;
  } catch {
    return null;
  }
}

export function hasRole(
  user: SessionUser | null,
  roles: Array<Role>,
): boolean {
  return Boolean(user && user.role && roles.includes(user.role));
}
