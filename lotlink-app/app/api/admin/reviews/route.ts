import { handleAdminListReviews } from "../../../../api/admin-reviews";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleAdminListReviews(request);
}
