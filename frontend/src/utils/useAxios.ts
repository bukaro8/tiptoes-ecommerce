import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"; // <-- FIXED
import {
  isAccessTokenExpired,
  setAuthUser,
  getRefreshToken,
} from "./auth";
import { BASE_URL } from "./constant";
import Cookies from "js-cookie";

export const userAxios = async (): Promise<AxiosInstance> => {
  const accessToken = Cookies.get("access_token");

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  });

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const currentAccess = Cookies.get("access_token");
      const currentRefresh = Cookies.get("refresh_token");

      if (!currentAccess || !currentRefresh) return config;

      // If token is still valid, just continue
      if (!isAccessTokenExpired(currentAccess)) return config;

      // Otherwise refresh token
      const refreshed = await getRefreshToken(currentRefresh);
      setAuthUser(refreshed.access, refreshed.refresh);

      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${refreshed.access}`;

      return config;
    }
  );

  return axiosInstance;
};

export default userAxios;
