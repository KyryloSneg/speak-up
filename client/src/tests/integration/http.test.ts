import $api from "@/http";
import { LocalStorageKeys } from "@/types/localStorage";
import { ApiRoutes, objectEntries } from "@speak-up/shared";
import { AxiosError } from "axios";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@/utils/handleLogout", () => ({
  default: vi.fn(),
}));

const API_URL = "http://localhost:7000";
const server = setupServer();

type BaseApiRoutesType = {
  readonly [K in keyof typeof ApiRoutes]: `${typeof API_URL}${(typeof ApiRoutes)[K]}`;
};

const BaseApiRoutes = Object.fromEntries(
  objectEntries(ApiRoutes).map(([key, value]) => [key, `${API_URL}${value}`]),
) as unknown as BaseApiRoutesType;

describe("http", () => {
  beforeAll(() => {
    vi.stubEnv("VITE_API_URL", API_URL);
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();

    localStorage.clear();
  });

  afterAll(() => {
    server.close();
  });

  const signInReqBody = { username: "username", password: "password" } as const;
  const changeNicknameReqBody = { nickname: "nickname" } as const;

  const okSignInResBody = {
    user: { id: "id" },
    tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
  } as const;

  const okChangeNicknameResBody = {
    id: "id",
  } as const;

  const errorResBody = {
    message: "message",
  } as const;

  describe("safeRequest", () => {
    it("should properly handle a successful response", async () => {
      const status = 200;
      server.use(
        http.post(BaseApiRoutes.SIGN_IN, () =>
          HttpResponse.json(okSignInResBody, { status }),
        ),
      );

      const res = await $api.auth.signIn(signInReqBody);

      expect(res.data).toStrictEqual(okSignInResBody);
      expect(res.error).toBeNull();
      expect(res.originalError).toBeNull();
      expect(res.status).toBe(status);
      expect(res.errorMessage).toBeNull();
    });

    it("should properly handle an error response with no error throwing", async () => {
      const status = 421;
      server.use(
        http.post(BaseApiRoutes.SIGN_IN, () =>
          HttpResponse.json(errorResBody, { status }),
        ),
      );

      const res = await $api.auth.signIn(signInReqBody);

      expect(res.data).toBeNull();
      expect(res.error).toStrictEqual(errorResBody);
      expect(res.originalError).toBeInstanceOf(AxiosError);
      expect(res.status).toBe(status);
      expect(res.errorMessage).toBe(errorResBody.message);
    });
  });

  describe("$api routes", () => {
    it("should make a proper register request", async () => {
      const resBody = {
        user: { id: "id" },
        tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
      } as const;

      server.use(
        http.post(BaseApiRoutes.REGISTER, () => HttpResponse.json(resBody)),
      );

      const reqBody = {
        nickname: "nickname",
        username: "username",
        password: "password",
      } as const;

      const res = await $api.auth.register(reqBody as any);
      expect(res.data).toStrictEqual(resBody);
    });

    it("should make a proper sign-in request", async () => {
      server.use(
        http.post(BaseApiRoutes.SIGN_IN, () =>
          HttpResponse.json(okSignInResBody),
        ),
      );

      const res = await $api.auth.signIn(signInReqBody as any);
      expect(res.data).toStrictEqual(okSignInResBody);
    });

    it("should make a proper logout request", async () => {
      const resBody = {
        id: "id",
        userId: "userId",
        refreshToken: "refreshToken",
      } as const;

      server.use(
        http.post(BaseApiRoutes.LOGOUT, () => HttpResponse.json(resBody)),
      );

      const res = await $api.auth.logout();
      expect(res.data).toStrictEqual(resBody);
    });

    it("should make a proper refresh request", async () => {
      const resBody = {
        user: { id: "id" },
        tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
      } as const;

      server.use(
        http.get(BaseApiRoutes.REFRESH, () => HttpResponse.json(resBody)),
      );

      const res = await $api.auth.refresh();
      expect(res.data).toStrictEqual(resBody);
    });

    it("should make a proper change-nickname request", async () => {
      const resBody = { id: "id" } as const;

      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, () =>
          HttpResponse.json(resBody),
        ),
      );

      const res = await $api.user.changeNickname(changeNicknameReqBody as any);
      expect(res.data).toStrictEqual(resBody);
    });
  });

  describe("authApiInstance request interceptor", () => {
    it("should properly attach access token to the auth request", async () => {
      const accessToken = "accessToken";
      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, accessToken);

      let authorizationHeader: string | null | undefined;
      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, ({ request }) => {
          authorizationHeader = request.headers.get("Authorization");
          return HttpResponse.json(okChangeNicknameResBody);
        }),
      );

      await $api.user.changeNickname(changeNicknameReqBody as any);
      expect(authorizationHeader).toBe(`Bearer ${accessToken}`);
    });

    it("should not attach access token to the auth request if it doesn't exist", async () => {
      let authorizationHeader: string | null | undefined;
      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, ({ request }) => {
          authorizationHeader = request.headers.get("Authorization");
          return HttpResponse.json(okChangeNicknameResBody);
        }),
      );

      await $api.user.changeNickname(changeNicknameReqBody as any);
      expect(authorizationHeader).toBeNull();
    });
  });

  describe("authApiInstance response interceptor", () => {
    it("should repeat the request that was initially sent with an unexpired accessToken", async () => {
      let timesRequestHasBeenCalled = 0;
      let timesRefreshHasBeenCalled = 0;

      const expiredAccessToken = "expiredAccessToken";
      const freshAccessToken = "freshAccessToken";

      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, expiredAccessToken);

      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, ({ request }) => {
          timesRequestHasBeenCalled++;
          const authorizationHeader = request.headers.get("Authorization");

          if (authorizationHeader === `Bearer ${expiredAccessToken}`) {
            return HttpResponse.json(errorResBody, { status: 401 });
          }

          if (authorizationHeader === `Bearer ${freshAccessToken}`) {
            return HttpResponse.json(okChangeNicknameResBody, { status: 200 });
          }

          return HttpResponse.json(errorResBody, { status: 500 });
        }),
        http.get(BaseApiRoutes.REFRESH, () => {
          timesRefreshHasBeenCalled++;

          return HttpResponse.json({
            user: { id: "id" },
            tokens: {
              accessToken: freshAccessToken,
              refreshToken: "refreshToken",
            },
          });
        }),
      );

      const res = await $api.user.changeNickname(changeNicknameReqBody as any);

      expect(res.data).toStrictEqual(okChangeNicknameResBody);
      expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
        freshAccessToken,
      );

      expect(timesRequestHasBeenCalled).toBe(2);
      expect(timesRefreshHasBeenCalled).toBe(1);
    });

    it("should not repeat the request that was initially sent with an unexpired accessToken which couldn't be successfully refreshed later", async () => {
      let timesRequestHasBeenCalled = 0;
      let timesRefreshHasBeenCalled = 0;

      const expiredAccessToken = "expiredAccessToken";
      const freshAccessToken = "freshAccessToken";

      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, expiredAccessToken);

      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, ({ request }) => {
          timesRequestHasBeenCalled++;
          const authorizationHeader = request.headers.get("Authorization");

          if (authorizationHeader === `Bearer ${expiredAccessToken}`) {
            return HttpResponse.json(errorResBody, { status: 401 });
          }

          if (authorizationHeader === `Bearer ${freshAccessToken}`) {
            return HttpResponse.json(okChangeNicknameResBody, { status: 200 });
          }

          return HttpResponse.json(errorResBody, { status: 500 });
        }),
        http.get(BaseApiRoutes.REFRESH, () => {
          timesRefreshHasBeenCalled++;

          return HttpResponse.json(errorResBody, { status: 500 });
        }),
      );

      const res = await $api.user.changeNickname(changeNicknameReqBody as any);

      expect(res.error).toStrictEqual(errorResBody);
      expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
        expiredAccessToken,
      );

      expect(timesRequestHasBeenCalled).toBe(1);
      expect(timesRefreshHasBeenCalled).toBe(1);
    });

    it("should trigger refresh only once if multiple requests with unexpired access token hit the server simultaneously", async () => {
      let timesRequestsHaveBeenCalled = 0;
      let timesRefreshHasBeenCalled = 0;

      const expiredAccessToken = "expiredAccessToken";
      const freshAccessToken = "freshAccessToken";

      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, expiredAccessToken);

      server.use(
        http.patch(BaseApiRoutes.CHANGE_NICKNAME, ({ request }) => {
          timesRequestsHaveBeenCalled++;
          const authorizationHeader = request.headers.get("Authorization");

          if (authorizationHeader === `Bearer ${expiredAccessToken}`) {
            return HttpResponse.json(errorResBody, { status: 401 });
          }

          if (authorizationHeader === `Bearer ${freshAccessToken}`) {
            return HttpResponse.json(okChangeNicknameResBody, { status: 200 });
          }

          return HttpResponse.json(errorResBody, { status: 500 });
        }),
        http.get(BaseApiRoutes.REFRESH, async () => {
          timesRefreshHasBeenCalled++;

          await new Promise(res => setTimeout(res, 30));
          return HttpResponse.json({
            user: { id: "id" },
            tokens: {
              accessToken: freshAccessToken,
              refreshToken: "refreshToken",
            },
          });
        }),
      );

      const [firstRes, secRes] = await Promise.all([
        $api.user.changeNickname(changeNicknameReqBody as any),
        $api.user.changeNickname(changeNicknameReqBody as any),
      ]);

      expect(firstRes.data).toStrictEqual(okChangeNicknameResBody);
      expect(secRes.data).toStrictEqual(okChangeNicknameResBody);

      expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
        freshAccessToken,
      );

      expect(timesRequestsHaveBeenCalled).toBe(4);
      expect(timesRefreshHasBeenCalled).toBe(1);
    });
  });
});
