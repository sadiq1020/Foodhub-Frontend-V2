import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://foodhub-backend-v2.onrender.com";

async function handler(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!["host", "connection"].includes(key)) {
      headers.set(key, value);
    }
  });

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const res = await fetch(url, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  // Copy response headers, but rewrite Set-Cookie to remove the Domain
  // attribute — otherwise the browser assigns cookies to onrender.com
  // instead of vercel.app
  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      // Strip Domain=...; so the cookie is scoped to the current host (vercel.app)
      const rewritten = value
        .split(";")
        .filter((part) => !part.trim().toLowerCase().startsWith("domain="))
        .join(";");
      responseHeaders.append("set-cookie", rewritten);
    } else if (key.toLowerCase() === "location") {
      // If backend redirects to its own domain, rewrite to frontend
      const rewritten = value.replace(BACKEND_URL, "");
      responseHeaders.set("location", rewritten || "/");
    } else {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
