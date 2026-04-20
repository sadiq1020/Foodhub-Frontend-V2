import type { ApiError } from "@/types";

const BASE_URL = "/api/v1";

// Parse the error response from the backend into a structured ApiError
const parseError = async (res: Response): Promise<ApiError> => {
  try {
    const data = await res.json();
    return {
      statusCode: res.status,
      message: data.message || data.error || "Something went wrong",
      errorDetails: data.errorDetails,
    };
  } catch {
    return {
      statusCode: res.status,
      message: `HTTP ${res.status}: ${res.statusText}`,
    };
  }
};

// Custom error class that carries the full API error shape
export class ApiRequestError extends Error {
  public statusCode: number;
  public errorDetails?: ApiError["errorDetails"];

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiRequestError";
    this.statusCode = apiError.statusCode;
    this.errorDetails = apiError.errorDetails;
  }
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const apiError = await parseError(res);

    // Session expired or not authenticated — redirect to login
    if (apiError.statusCode === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw new ApiRequestError(apiError);
  }
  return res.json();
};

const get = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

const post = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

const put = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

const patch = async (endpoint: string, body: unknown) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

// multipart/form-data — no Content-Type header (browser sets it with boundary)
const postForm = async (endpoint: string, body: FormData) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body,
  });
  return handleResponse(res);
};

const putForm = async (endpoint: string, body: FormData) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    credentials: "include",
    body,
  });
  return handleResponse(res);
};

const del = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
};

export const api = {
  get,
  post,
  put,
  patch,
  postForm, // ← new — for Cloudinary image uploads
  putForm, // ← new — for Cloudinary image uploads
  delete: del,
};
