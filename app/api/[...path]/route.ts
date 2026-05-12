import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_PATHS = new Set([
  "diagnostics/collectors",
  "overview",
  "trades/active",
  "trades/history",
  "trades/export",
  "metrics",
  "equity-curve",
  "daily-pnl",
  "health",
]);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const UNSAFE_PROXY_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
]);

function getApiBaseUrl() {
  const baseUrl =
    process.env.DASHBOARD_API_BASE_URL?.trim() ?? process.env.API_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  return baseUrl.replace(/\/+$/, "");
}

function getApiKey() {
  const apiKey =
    process.env.DASHBOARD_API_KEY?.trim() ?? process.env.API_KEY?.trim();

  return apiKey || null;
}

function buildUpstreamUrl(pathname: string, searchParams: URLSearchParams) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const upstreamUrl = new URL(`${baseUrl}/api/${pathname}`);
  searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  return upstreamUrl;
}

function buildResponseHeaders(headers: Headers) {
  const forwardedHeaders = new Headers();

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (
      !HOP_BY_HOP_HEADERS.has(normalizedKey) &&
      !UNSAFE_PROXY_RESPONSE_HEADERS.has(normalizedKey)
    ) {
      forwardedHeaders.set(key, value);
    }
  });

  forwardedHeaders.set("Cache-Control", "no-store");
  forwardedHeaders.set("Pragma", "no-cache");
  forwardedHeaders.set("Expires", "0");

  return forwardedHeaders;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joined = path.join("/");

  if (!ALLOWED_PATHS.has(joined)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = buildUpstreamUrl(joined, request.nextUrl.searchParams);

  if (!url) {
    return NextResponse.json(
      {
        error:
          "Missing DASHBOARD_API_BASE_URL server environment variable.",
      },
      { status: 500 }
    );
  }

  const headers = new Headers();

  if (joined !== "health") {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing DASHBOARD_API_KEY server environment variable.",
        },
        { status: 500 }
      );
    }

    headers.set("X-API-Key", apiKey);
  }

  try {
    const upstreamResponse = await fetch(url, {
      headers,
      cache: "no-store",
    });

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: buildResponseHeaders(upstreamResponse.headers),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach trading API" },
      { status: 502 }
    );
  }
}
