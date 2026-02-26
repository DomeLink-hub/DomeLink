import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function loginAPI(role: "homeowner" | "architect", email: string, password: string) {
  const url = `${API_BASE}/auth/${role}/login`;
  const res = await axios.post(url, { email, password });
  if (!res.data.token || !res.data.user) throw new Error("Invalid login response");
  localStorage.setItem("domelink_token", res.data.token);
  return res.data;
}

export async function signupAPI(role: "homeowner" | "architect", name: string, email: string, password: string) {
  const url = `${API_BASE}/auth/${role}/signup`;
  const res = await axios.post(url, { name, email, password });
  if (!res.data.token || !res.data.user) throw new Error("Invalid signup response");
  localStorage.setItem("domelink_token", res.data.token);
  return res.data;
}

export async function logoutAPI() {
  localStorage.removeItem("domelink_token");
}

export async function getUserFromToken(token: string) {
  const res = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
}
