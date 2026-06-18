import { apiFetch } from "./api";

const SESSION_KEY = "hrms_session";

export async function loginUser(email, password) {
  const token = btoa(`${email}:${password}`);
  const authHeader = `Basic ${token}`;

  // Call the login endpoint with basic auth
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Authorization": authHeader
    }
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || "Invalid login response");
  }

  const userData = response.data;
  const session = {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    fullName: userData.fullName,
    employeeId: userData.employeeId,
    profilePic: userData.profilePic,
    authHeader: authHeader
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function updateSession(updates) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const current = JSON.parse(raw);
    const updated = { ...current, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    // Dispatch custom event to let dropdown and headers update immediately
    window.dispatchEvent(new Event("session-update"));
    return updated;
  } catch (e) {
    console.error("Failed to update session storage", e);
    return null;
  }
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}
