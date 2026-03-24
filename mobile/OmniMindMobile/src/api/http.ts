import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Fiziksel cihaz / farklı makine: .env içinde EXPO_PUBLIC_API_URL=http://192.168.x.x:5068
 * Android emülatör: 10.0.2.2
 * iOS simülatör: localhost
 */
const fromEnv =
  typeof process.env.EXPO_PUBLIC_API_URL === "string" &&
  process.env.EXPO_PUBLIC_API_URL.length > 0
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
    : null;

const fallback =
  Platform.OS === "android" ? "http://10.0.2.2:5068" : "http://localhost:5068";

export const API_BASE_URL = fromEnv ?? fallback;

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log(
      "AXIOS ERR <=",
      err?.message,
      err?.config?.baseURL,
      err?.config?.url,
      err?.response?.status,
      err?.response?.data
    );
    throw err;
  }
);
