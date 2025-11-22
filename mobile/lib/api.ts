export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";
//export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000" || "http://10.10.4.215:8000" || "http://0.0.0.0:8000";

/**
 * JSON API fetch (application/json)
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL no está definido en .env");

  const url = `${API_URL}${endpoint}`.replace(/([^:]\/)\/+/g, "$1");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch {}
    throw new Error((parsed && parsed.detail) ? JSON.stringify(parsed.detail) : (text || "Error en la petición"));
  }

  return res.json();
}

/**
 * Form URL encoded POST used for OAuth2 password flow
 * bodyObj should be a plain object { username: '...', password: '...', grant_type: 'password' }
 */
export async function apiFetchForm(endpoint: string, bodyObj: Record<string, any>) {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL no está definido en .env");

  const url = `${API_URL}${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
  const body = Object.keys(bodyObj)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(bodyObj[k]))
    .join("&");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch {}
    throw new Error((parsed && parsed.detail) ? JSON.stringify(parsed.detail) : (text || "Error en la petición"));
  }

  return res.json();
}
