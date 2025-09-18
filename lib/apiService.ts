// lib/apiService.ts
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function loginService(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  const responseClone = response.clone();
  console.log('Login response status:', response.status);
  console.log('Login response headers:', response.headers);
  console.log('Login response body:', await responseClone.text());
  if (!response.ok) throw new Error("Email ou senha incorretos");
  const data = await response.json()
  Cookies.set("token", data.token, { expires: 1 })
  return data
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = Cookies.get("token")
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  if (!response.ok) throw new Error("Erro na requisição")
  return response.json()
}
