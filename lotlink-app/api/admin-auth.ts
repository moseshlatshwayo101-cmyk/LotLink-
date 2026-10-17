/**
 * Server-side admin authentication.
 * Requires ADMIN_TOKEN environment variable.
 * Token is never returned in responses.
 */

export function getAdminToken(): string | undefined {
  const token = process.env.ADMIN_TOKEN;
  if (typeof token === "string" && token.trim().length >= 16) {
    return token.trim();
  }
  return undefined;
}

export function isAdminAuthorized(request: Request): boolean {
  const expected = getAdminToken();
  if (!expected) {
    // Fail closed when no token is configured
    return false;
  }

  const header = request.headers.get("x-lotlink-admin-token");
  if (header && header === expected) return true;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice(7) === expected) return true;

  // Optional cookie for browser UI (HttpOnly recommended when set by a login route)
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)lotlink_admin_token=([^;]+)/);
  if (match && decodeURIComponent(match[1]) === expected) return true;

  return false;
}

export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Unauthorized",
      message: "Valid admin token required. Set ADMIN_TOKEN and pass X-LotLink-Admin-Token header.",
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "WWW-Authenticate": "Bearer realm=\"LotLink Admin\"",
      },
    }
  );
}

export function adminNotConfiguredResponse(): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Admin not configured",
      message: "ADMIN_TOKEN environment variable is not set (min 16 characters).",
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}
