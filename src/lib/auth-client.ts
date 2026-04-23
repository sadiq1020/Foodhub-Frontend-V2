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

// Point directly to the backend for all auth operations.
// OAuth state cookies need to be set and read on the backend domain.
// Proxying auth through Vercel causes state mismatch and login failures.
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://foodhub-backend-v2.onrender.com",
  fetchOptions: {
    credentials: "include",
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
