import { useAuthStore } from "../store/auth";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";
import Cookies from "js-cookie";

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RegisterResult<T = unknown> {
  data: T | null;
  error: string | null;
}

interface RefreshResponse {
  access: string;
  refresh: string;
}

// shape of error returned by your API
interface ApiErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

// shape of your decoded JWT with user info
interface DecodedUser extends JwtPayload {
  user_id: string;
  username: string;
  email: string;
}

/* ---------- LOGIN ---------- */

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post<LoginResponse>("user/token/", {
      email,
      password,
    });

    const { data, status } = response;

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { data, error: null as string | null };
  } catch (err: unknown) {
    let message = "Something went wrong";

    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const detail = axiosError.response?.data?.detail;
      if (detail) {
        message = detail;
      }
    }

    return {
      data: null,
      error: message,
    };
  }
};

/* ---------- REGISTER ---------- */

export const register = async (
  full_name: string,
  email: string,
  phone: string,
  password: string,
  password2: string
): Promise<RegisterResult> => {
  try {
    const response = await axios.post("user/register/", {
      full_name,
      email,
      phone,
      password,
      password2,
    });

    const { data } = response;

    await login(email, password);

    return { data, error: null };
  } catch (err: unknown) {
    let message = "Something went wrong";

    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const detail = axiosError.response?.data?.detail;
      if (detail) {
        message = detail;
      }
    }

    return {
      data: null,
      error: message,
    };
  }
};

/* ---------- LOGOUT ---------- */

export const logout = (): void => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  useAuthStore.getState().setUser(null);
};

/* ---------- SET USER FROM TOKENS ---------- */

export const setUser = async (): Promise<void | null> => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  if (isAccessTokenExpired(accessToken)) {
    const response = await getRefreshToken(refreshToken);
    setAuthUser(response.access, response.refresh);
  } else {
    setAuthUser(accessToken, refreshToken);
  }
};

/* ---------- STORE + COOKIES ---------- */

export const setAuthUser = (
  access_token: string,
  refresh_token: string
): void => {
  Cookies.set("access_token", access_token, {
    expires: 1,
    secure: true,
  });

  Cookies.set("refresh_token", refresh_token, {
    expires: 1,
    secure: true,
  });

  const user = jwtDecode<DecodedUser>(access_token);

  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
};

/* ---------- REFRESH TOKEN ---------- */

export const getRefreshToken = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  const response = await axios.post<RefreshResponse>("user/token/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};

/* ---------- TOKEN EXPIRY ---------- */

export const isAccessTokenExpired = (accessToken: string): boolean => {
  try {
    const decodedToken = jwtDecode<JwtPayload>(accessToken);
    // exp is in seconds, Date.now() is milliseconds
    return decodedToken.exp !== undefined
      ? decodedToken.exp * 1000 < Date.now()
      : true;
  } catch (error) {
    console.error(error);
    return true;
  }
};
