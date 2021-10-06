import { HttpPlugin, } from "../../index";
import { ResponseTypeEnum } from "../../w3";

import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

// mock axios
jest.mock("axios");
const mockedAxios = jest.requireMock<jest.Mocked<typeof axios>>("axios");

describe("test http plugin", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get method", () => {
    const plugin: HttpPlugin = new HttpPlugin();

    test("valid request: text response type", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        headers: { ["Content-Type"]: "application/json; charset=utf-8" },
        status: 200,
        statusText: "Ok",
        data: "{result: 1001}",
        config: {
          responseType: "text",
        },
      } as AxiosResponse);

      const response = await plugin.get("/api/test", {
        headers: [
          { key: "Accept", value: "application/json" },
          { key: "X-Test-Header", value: "test-header-value" },
        ],
        urlParams: [{ key: "q", value: "test-param" }],
        responseType: ResponseTypeEnum.TEXT,
      });

      expect(mockedAxios.get).lastCalledWith("/api/test", {
        headers: {
          ["Accept"]: "application/json",
          ["X-Test-Header"]: "test-header-value",
        },
        params: { q: "test-param" },
        responseType: "text",
      } as AxiosRequestConfig);

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("Ok");
      expect(response.headers).toStrictEqual([
        { key: "Content-Type", value: "application/json; charset=utf-8" },
      ]);
      expect(response.body).toBe("{result: 1001}");
    });

    test("valid request: arraybuffer response type", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        headers: { ["Content-Type"]: "application/json; charset=utf-8" },
        status: 200,
        statusText: "Ok",
        data: Buffer.from("{result: 1001}"),
        config: {
          responseType: "arraybuffer",
        },
      } as AxiosResponse);

      const response = await plugin.get("/api/test", {
        headers: [
          { key: "Accept", value: "application/json" },
          { key: "X-Test-Header", value: "test-header-value" },
        ],
        urlParams: [{ key: "q", value: "test-param" }],
        responseType: ResponseTypeEnum.BINARY,
      });

      expect(mockedAxios.get).lastCalledWith("/api/test", {
        headers: {
          ["Accept"]: "application/json",
          ["X-Test-Header"]: "test-header-value",
        },
        params: { q: "test-param" },
        responseType: "arraybuffer",
      } as AxiosRequestConfig);

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("Ok");
      expect(response.headers).toStrictEqual([
        { key: "Content-Type", value: "application/json; charset=utf-8" },
      ]);
      expect(response.body).toBeTruthy();
      if (response.body?.rawBody) {
        expect(response.body?.rawBody).toBe(Buffer.from("{result: 1001}"));
      }
    });
  });

  describe("post method", () => {
    const plugin: HttpPlugin = new HttpPlugin();

    test("valid request with headers", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        headers: { ["Content-Type"]: "application/json; charset=utf-8" },
        status: 200,
        statusText: "Ok",
        data: "{response: 1001}",
        config: {
          responseType: "text",
        },
      } as AxiosResponse);

      const response = await plugin.post("/api/test", {
        headers: [
          { key: "Accept", value: "application/json" },
          { key: "X-Test-Header", value: "test-header-value" },
        ],
        urlParams: [{ key: "q", value: "test-param" }],
        body: {stringBody: "{request: 1001}", formDataBody: {data: []}},
        responseType: ResponseTypeEnum.TEXT,
      });

      expect(mockedAxios.post).lastCalledWith("/api/test", "{request: 1001}", {
        headers: {
          ["Accept"]: "application/json",
          ["X-Test-Header"]: "test-header-value",
        },
        params: { q: "test-param" },
        responseType: "text",
      } as AxiosRequestConfig);

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("Ok");
      expect(response.headers).toStrictEqual([
        { key: "Content-Type", value: "application/json; charset=utf-8" },
      ]);
      expect(response.body).toBe("{response: 1001}");
    });

    test("valid request with url params", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        headers: { ["Content-Type"]: "application/json; charset=utf-8" },
        status: 200,
        statusText: "Ok",
        data: Buffer.from("{response: 1001}"),
        config: {
          responseType: "arraybuffer",
        },
      } as AxiosResponse);

      const response = await plugin.post("/api/test", {
        headers: [
          { key: "Accept", value: "application/json" },
          { key: "X-Test-Header", value: "test-header-value" },
        ],
        urlParams: [{ key: "q", value: "test-param" }],
        body: {stringBody: "{request: 1001}", formDataBody: {data: []}},
        responseType: ResponseTypeEnum.BINARY,
      });

      expect(mockedAxios.post).lastCalledWith("/api/test", "{request: 1001}", {
        headers: {
          ["Accept"]: "application/json",
          ["X-Test-Header"]: "test-header-value",
        },
        params: { q: "test-param" },
        responseType: "arraybuffer",
      } as AxiosRequestConfig);

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("Ok");
      expect(response.headers).toStrictEqual([
        { key: "Content-Type", value: "application/json; charset=utf-8" },
      ]);
      expect(response.body).toBeTruthy();
      if (response.body?.rawBody) {
        expect(response.body.rawBody).toBe(Buffer.from("{response: 1001}"));
      }
    });
  });
});
