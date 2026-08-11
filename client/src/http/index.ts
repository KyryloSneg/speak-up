import { LocalStorageKeys } from "@/types/localStorage";
import handleLogout from "@/utils/handleLogout";
import {
  ApiRoutes,
  type AnyErrorResponse,
  type ChangeNicknameRequestBody,
  type ChangeNicknameResponseBody,
  type LogoutResponseBody,
  type RefreshResponseBody,
  type RegisterRequestBody,
  type RegisterResponseBody,
  type SignInRequestBody,
  type SignInResponseBody,
} from "@speak-up/shared";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

type SuccessResponseBody<ResponseBody> = Exclude<
  ResponseBody,
  AnyErrorResponse
>;

type SafeResponse<ResponseBody> =
  | {
      data: SuccessResponseBody<ResponseBody>;
      error: null;
      originalError: null;
      status: number;
      errorMessage: null;
    }
  | {
      data: null;
      error: Exclude<ResponseBody, SuccessResponseBody<ResponseBody>> | null;
      originalError: AxiosError;
      status: number;
      errorMessage: string;
    };

async function safeRequest<ResponseBody>(
  instance: AxiosInstance,
  config: AxiosRequestConfig,
): Promise<SafeResponse<ResponseBody>> {
  try {
    const res = await instance(config);

    return {
      data: res.data,
      error: null,
      originalError: null,
      status: res.status,
      errorMessage: null,
    };
  } catch (e) {
    const error = e as AxiosError;
    const resError =
      (error?.response?.data as Exclude<
        ResponseBody,
        SuccessResponseBody<ResponseBody>
      >) || null;

    return {
      data: null,
      error: resError,
      originalError: error,
      status: error.response?.status || 0,
      errorMessage:
        (resError as { message: string } | null)?.message ||
        (resError as { error: string } | null)?.error ||
        error.message,
    };
  }
}

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const authApiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const $api = {
  auth: {
    register: (data: RegisterRequestBody) =>
      safeRequest<RegisterResponseBody>(apiInstance, {
        method: "POST",
        url: ApiRoutes.REGISTER,
        data,
      }),
    signIn: (data: SignInRequestBody) =>
      safeRequest<SignInResponseBody>(apiInstance, {
        method: "POST",
        url: ApiRoutes.SIGN_IN,
        data,
      }),
    logout: () =>
      safeRequest<LogoutResponseBody>(authApiInstance, {
        method: "POST",
        url: ApiRoutes.LOGOUT,
      }),
    refresh: () =>
      safeRequest<RefreshResponseBody>(authApiInstance, {
        method: "GET",
        url: ApiRoutes.REFRESH,
      }),
  },
  user: {
    changeNickname: (data: ChangeNicknameRequestBody) =>
      safeRequest<ChangeNicknameResponseBody>(authApiInstance, {
        method: "PATCH",
        url: ApiRoutes.CHANGE_NICKNAME,
        data,
      }),
  },
} as const;

authApiInstance.interceptors.request.use(config => {
  const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);
  if (!accessToken || typeof accessToken !== "string") return config;

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

authApiInstance.interceptors.response.use(
  undefined,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // saves us from the infinite loop of retries
      originalRequest._retry = true;

      if (originalRequest.url?.includes(ApiRoutes.REFRESH)) {
        await handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // let the queue decide when to continue the chain
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return authApiInstance(originalRequest);
        });
      }

      isRefreshing = true;

      const refreshResponse = await $api.auth.refresh();
      if (!refreshResponse.data) {
        isRefreshing = false;

        processQueue(refreshResponse.originalError, null);
        await handleLogout();

        return Promise.reject(refreshResponse.originalError);
      }

      const {
        tokens: { accessToken },
      } = refreshResponse.data;

      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      processQueue(null, accessToken);
      isRefreshing = false;

      return authApiInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });

  failedQueue.length = 0;
}

export default $api;
