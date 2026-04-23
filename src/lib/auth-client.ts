// import { env } from "@/env";
// import { createAuthClient } from "better-auth/react";

// // export const authClient = createAuthClient({
// //   baseURL: env.NEXT_PUBLIC_API_URL,
// // });

// // trying solution cookies after deployment
// export const authClient = createAuthClient({
//   // baseURL: env.NEXT_PUBLIC_API_URL,
//   baseURL: `${env.NEXT_PUBLIC_FRONTEND_URL}/api/auth`, // ✅ Changed - points to frontend proxy
//   // ✅ Add fetch options for cross-domain cookies
//   fetchOptions: {
//     credentials: "include", // Send cookies with cross-domain requests
//   },
// });

// export const { signIn, signUp, signOut, useSession } = authClient;

// ---------------------------------------------------------------------------

import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// ✅ Point DIRECTLY to the backend — DO NOT proxy through Vercel
// Reason: Better-auth needs to set cookies on the backend domain.
// When proxying through Vercel, the Set-Cookie response header from Render
// doesn't properly translate to the browser — the response appears to come
// from Vercel, not the Render backend, so cookies get lost.
//
// With SameSite: None; Secure configured on the backend (which it is),
// the browser will accept cookies from the backend domain and send them
// with credentials: "include" on subsequent requests.
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://foodhub-backend-v2.onrender.com",
  fetchOptions: {
    credentials: "include", // Send cookies with cross-origin requests
  },
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

// ---------------------------------------------------------------------------
// import { emailOTPClient } from "better-auth/client/plugins";
// import { createAuthClient } from "better-auth/react";

// // authClient must point DIRECTLY to the backend — not through the Next.js proxy.
// // Reason: the session cookie lives on onrender.com. If we proxy through Vercel,
// // the Vercel server forwards the request but has no cookies — the browser's
// // onrender.com cookies never get sent. Pointing directly to the backend lets
// // the browser send its cookies itself (credentials: "include" + SameSite: None).
// export const authClient = createAuthClient({
//   baseURL:
//     process.env.NEXT_PUBLIC_API_URL ||
//     "https://foodhub-backend-v2.onrender.com",
//   fetchOptions: {
//     credentials: "include",
//   },
//   plugins: [emailOTPClient()],
// });

// export const { signIn, signUp, signOut, useSession } = authClient;
