// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";

// export const { POST, GET } = toNextJsHandler(auth);

// export {};

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://foodhub-backend-v2.onrender.com";

async function handler(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/auth", "/api/auth");
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
    redirect: "manual", // don't follow redirects — let the browser handle them
  });

  const response = new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });

  return response;
}

export const GET = handler;
export const POST = handler;
