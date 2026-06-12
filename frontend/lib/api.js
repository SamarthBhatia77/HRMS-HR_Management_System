const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export async function apiFetch(path, init) {
  let authHeader = null;
  if (typeof window !== "undefined") {
    try {
      const sessionRaw = localStorage.getItem("hrms_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session && session.authHeader) {
          authHeader = session.authHeader;
        }
      }
    } catch {
      // ignore
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...init?.headers,
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API request failed: ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
