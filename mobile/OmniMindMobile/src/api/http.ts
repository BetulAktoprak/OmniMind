import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:5068"
  : "http://localhost:5068";

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});


http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

http.interceptors.response.use(
  (res) => {
    return res;
  },
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
