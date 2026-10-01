// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL 
// || "http://localhost:5000/api";

export async function fetcher(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Extracting the  server message to show in tost
    const errorMsg = data.messages || data.message || data.error || data.errormessage || `Request failed (${res.status})`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}