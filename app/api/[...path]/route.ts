import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8099";
const API_KEY = process.env.API_KEY ?? "";

const ALLOWED_PATHS = new Set([
  "overview",
  "trades/active",
  "trades/history",
  "trades/export",
  "metrics",
  "equity-curve",
  "daily-pnl",
  "health",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joined = path.join("/");

  if (!ALLOWED_PATHS.has(joined)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(`${API_URL}/api/${joined}`);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const headers = new Headers();
      for (const headerName of [
        "content-type",
        "content-disposition",
        "content-length",
      ]) {
        const headerValue = res.headers.get(headerName);
        if (headerValue) {
          headers.set(headerName, headerValue);
        }
      }

      return new NextResponse(res.body, {
        status: res.status,
        headers,
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach trading API" },
      { status: 502 }
    );
  }
}
