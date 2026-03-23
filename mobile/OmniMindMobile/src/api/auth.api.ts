import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import { http } from "./http";

export async function registerApi(data: RegisterRequest) {
  const res = await http.post<AuthResponse>("/api/auth/register", data);
  return res.data;
}

export async function loginApi(data: LoginRequest) {
  const res = await http.post<AuthResponse>("/api/auth/login", data);
  return res.data;
}
