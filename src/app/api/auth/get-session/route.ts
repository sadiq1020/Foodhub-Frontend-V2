import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://foodhub-backend-v2.onrender.com";

export async function GET(request: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const data = await res.json();

  // Forward any Set-Cookie headers from backend to the browser
  const response = NextResponse.json(data, { status: res.status });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
