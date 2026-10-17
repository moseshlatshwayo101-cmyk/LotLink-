import { handleAdminDecide } from "../../../../../api/admin-reviews";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleAdminDecide(request);
}
