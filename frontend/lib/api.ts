const API_URL = "http://13.60.41.217/api";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Content-Type", "application/json");

  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(
      Array.isArray(message) ? message.join(", ") : message,
    );
  }

  return data;
}

export function saveAuth(data: {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
}) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}
