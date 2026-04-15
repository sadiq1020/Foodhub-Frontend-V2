// ✅ Improved API client with better error handling
// Use the frontend proxy path so requests go through Next.js rewrites
// and preserve authentication cookies in development and production.
const BASE_URL = "/api/v1";

// Helper to parse error responses
const parseError = async (res: Response) => {
  try {
    const data = await res.json();
    return data.message || data.error || "Something went wrong";
  } catch {
    return `HTTP ${res.status}: ${res.statusText}`;
  }
};

// GET request
const get = async (endpoint: string) => {
  const fullUrl = `${BASE_URL}${endpoint}`;
  // console.log("🌐 API GET:", fullUrl);

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  // console.log("📡 Response status:", res.status);
  // console.log("📡 Response URL:", res.url);

  if (!res.ok) {
    const error = await parseError(res);
    throw new Error(error);
  }

  return await res.json();
};

// POST request
const post = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw new Error(error);
  }

  return await res.json();
};

// PUT request
const put = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw new Error(error);
  }

  return await res.json();
};

// PATCH request
const patch = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw new Error(error);
  }

  return await res.json();
};

// DELETE request
const del = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw new Error(error);
  }

  return await res.json();
};

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
};

// GET request
// const get = async (endpoint: string) => {
//   const res = await fetch(`${BASE_URL}${endpoint}`, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     credentials: "include",
//   });

//   if (!res.ok) {
//     const error = await parseError(res);
//     throw new Error(error);
//   }

//   return await res.json();
// };
