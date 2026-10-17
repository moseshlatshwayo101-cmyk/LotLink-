import { handleHealth } from "../../../api/health";

export const runtime = "nodejs";

export async function GET() {
  return handleHealth();
}
