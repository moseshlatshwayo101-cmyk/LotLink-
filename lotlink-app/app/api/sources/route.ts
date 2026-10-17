import { handleSources } from "../../../api/sources";

export const runtime = "nodejs";

export async function GET() {
  return handleSources();
}
