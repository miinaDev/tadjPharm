const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && data?.error ? data.error : "Une erreur est survenue";
    throw new ApiError(res.status, message, isJson ? data?.details : undefined);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body: body === undefined ? undefined : JSON.stringify(body) }),
};

export function resolveMediaUrl(url: string, width?: number): string {
  // Stockage disque local (developpement) : chemin relatif a prefixer par l'API.
  if (!/^https?:\/\//i.test(url)) return `${API_URL}${url}`;

  // Cloudinary : on injecte des transformations de livraison juste apres "/upload/" pour que
  // Cloudinary compresse (q_auto), serve un format moderne WebP/AVIF selon le navigateur (f_auto)
  // et plafonne la largeur (w_<width>,c_limit = reduit sans jamais agrandir). La version derivee
  // est mise en cache par Cloudinary -> bande passante divisee par ~20-40 sans perte visible.
  const marker = "/upload/";
  const uploadIdx = url.indexOf(marker);
  if (url.includes("res.cloudinary.com") && uploadIdx !== -1) {
    const rest = url.slice(uploadIdx + marker.length);
    // Idempotence : ne rien reinjecter si une transformation est deja presente.
    if (/^(f_auto|q_auto|w_)/.test(rest)) return url;
    const transforms = width ? `f_auto,q_auto,w_${width},c_limit` : "f_auto,q_auto";
    return `${url.slice(0, uploadIdx + marker.length)}${transforms}/${rest}`;
  }

  // Autre URL absolue (non Cloudinary) : servie telle quelle.
  return url;
}
