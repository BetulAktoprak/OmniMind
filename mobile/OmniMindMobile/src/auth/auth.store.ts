import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse } from "../types/auth";

export async function saveAuth(auth: AuthResponse) {
  await AsyncStorage.setItem("accessToken", auth.accessToken);
  await AsyncStorage.setItem("expiresAt", auth.expiresAt);
  await AsyncStorage.setItem("userId", auth.userId);
  await AsyncStorage.setItem("email", auth.email);
  await AsyncStorage.setItem("username", auth.username);
}

export async function getToken() {
  return AsyncStorage.getItem("accessToken");
}

export async function logout() {
  await AsyncStorage.multiRemove([
    "accessToken",
    "expiresAt",
    "userId",
    "email",
    "username",
  ]);
}
