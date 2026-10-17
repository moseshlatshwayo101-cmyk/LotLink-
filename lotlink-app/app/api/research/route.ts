import { handleResearch } from "../../../api/research";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleResearch(request);
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Method not allowed",
      message: "POST JSON body with asset, budget, currency, destination",
    }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}
