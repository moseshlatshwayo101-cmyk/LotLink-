import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Serves the server-protected admin review UI.
 * Auth is enforced by /api/admin/* ; this page only holds the client shell.
 */
export default function AdminPage() {
  // Prefer the static HTML shell so the existing UI logic stays intact
  let html = "";
  try {
    html = readFileSync(join(process.cwd(), "ui/admin/index.html"), "utf8");
  } catch {
    html = "<!DOCTYPE html><html><body><p>Admin UI file missing.</p></body></html>";
  }

  // Extract body inner content and styles for embedding in Next layout
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);

  const styles = styleMatch?.[1] ?? "";
  const body = bodyMatch?.[1] ?? "<p>Admin UI unavailable.</p>";
  // Point API_BASE at same-origin /api
  const script = (scriptMatch?.[1] ?? "").replace(
    'const API_BASE = "/api"',
    'const API_BASE = "/api"'
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
