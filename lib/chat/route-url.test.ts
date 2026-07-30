import { describe, expect, test } from "bun:test";
import { buildRouteRequest } from "./route-url";

const BASE = "https://app.example.com";

describe("path parameters", () => {
  test("interpolates a single parameter and drops it from the payload", () => {
    const { url, body } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/v3/surveys/{surveyId}",
      input: { surveyId: "abc123" },
    });
    expect(url).toBe("https://app.example.com/api/v3/surveys/abc123");
    expect(body).toBeUndefined();
  });

  test("interpolates multiple parameters", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys/{surveyId}/responses/{responseId}",
      input: { surveyId: "s1", responseId: "r2" },
    });
    expect(url).toBe("https://app.example.com/api/surveys/s1/responses/r2");
  });

  test("accepts a numeric parameter", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/pages/{page}",
      input: { page: 3 },
    });
    expect(url).toBe("https://app.example.com/api/pages/3");
  });

  test("percent-encodes values", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/tags/{tag}",
      input: { tag: "needs review & 100%" },
    });
    expect(url).toBe(
      "https://app.example.com/api/tags/needs%20review%20%26%20100%25",
    );
  });

  test("keeps path params out of the body on POST", () => {
    const { url, body } = buildRouteRequest({
      baseUrl: BASE,
      method: "POST",
      path: "/api/surveys/{surveyId}/responses",
      input: { surveyId: "s1", finished: true },
    });
    expect(url).toBe("https://app.example.com/api/surveys/s1/responses");
    expect(JSON.parse(body!)).toEqual({ finished: true });
  });
});

describe("path parameter rejection", () => {
  const reject = (input: unknown) =>
    buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys/{surveyId}",
      input,
    });

  test("rejects a value containing a path separator", () => {
    expect(() => reject({ surveyId: "a/b" })).toThrow(/path separator/);
    expect(() => reject({ surveyId: "a\\b" })).toThrow(/path separator/);
  });

  test("rejects traversal", () => {
    expect(() => reject({ surveyId: ".." })).toThrow(/\.\./);
    expect(() => reject({ surveyId: "x..y" })).toThrow(/\.\./);
  });

  test("rejects a missing value", () => {
    expect(() => reject({})).toThrow(/missing path parameter/);
    expect(() => reject({ surveyId: null })).toThrow(/missing path parameter/);
  });

  test("rejects an empty value", () => {
    expect(() => reject({ surveyId: "" })).toThrow(/must not be empty/);
  });

  test("rejects a non-primitive value", () => {
    expect(() => reject({ surveyId: { id: 1 } })).toThrow(/an object/);
    expect(() => reject({ surveyId: ["a"] })).toThrow(/an array/);
    expect(() => reject({ surveyId: true })).toThrow(/string or number/);
  });

  test("rejects input that isn't an object", () => {
    expect(() => reject("abc123")).toThrow(/no input object/);
  });

  test("rejects a value that escapes the project origin", () => {
    // encodeURIComponent would neutralise this, but the separator check fires
    // first — and the origin assertion is the backstop if it ever didn't.
    expect(() => reject({ surveyId: "/evil.com/x" })).toThrow(/path separator/);
  });

  test("rejects a stored path that escapes the project origin", () => {
    expect(() =>
      buildRouteRequest({
        baseUrl: BASE,
        method: "GET",
        path: "//evil.com/x",
        input: {},
      }),
    ).toThrow(/escaped the project baseUrl/);
  });
});

describe("query string (GET)", () => {
  test("sends leftover fields as query params", () => {
    const { url, body } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys",
      input: { limit: 10, q: "hello world" },
    });
    expect(url).toBe(
      "https://app.example.com/api/surveys?limit=10&q=hello+world",
    );
    expect(body).toBeUndefined();
  });

  test("repeats a key for array values", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys",
      input: { status: ["draft", "live"] },
    });
    expect(url).toBe(
      "https://app.example.com/api/surveys?status=draft&status=live",
    );
  });

  test("JSON-encodes object values", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/responses",
      input: { filter: { finished: true } },
    });
    expect(url).toBe(
      'https://app.example.com/api/responses?filter=%7B%22finished%22%3Atrue%7D',
    );
  });

  test("omits null and undefined", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys",
      input: { a: null, b: undefined, c: 1 },
    });
    expect(url).toBe("https://app.example.com/api/surveys?c=1");
  });

  test("combines path params and query params", () => {
    const { url } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys/{surveyId}/responses",
      input: { surveyId: "s1", limit: 5 },
    });
    expect(url).toBe(
      "https://app.example.com/api/surveys/s1/responses?limit=5",
    );
  });
});

describe("unchanged behaviour", () => {
  test("a plain GET with no input is byte-identical to before", () => {
    const { url, body } = buildRouteRequest({
      baseUrl: BASE,
      method: "GET",
      path: "/api/surveys",
      input: {},
    });
    expect(url).toBe(new URL("/api/surveys", BASE).toString());
    expect(body).toBeUndefined();
  });

  test("POST still sends the whole input as a JSON body", () => {
    const input = { items: [{ id: "a", quantity: 2 }] };
    const { url, body } = buildRouteRequest({
      baseUrl: BASE,
      method: "POST",
      path: "/api/orders",
      input,
    });
    expect(url).toBe(new URL("/api/orders", BASE).toString());
    expect(body).toBe(JSON.stringify(input));
  });

  test("DELETE keeps its body rather than moving to the query string", () => {
    const { body } = buildRouteRequest({
      baseUrl: BASE,
      method: "DELETE",
      path: "/api/surveys/{surveyId}",
      input: { surveyId: "s1", force: true },
    });
    expect(JSON.parse(body!)).toEqual({ force: true });
  });

  test("a baseUrl path prefix is replaced by an absolute path, as before", () => {
    const { url } = buildRouteRequest({
      baseUrl: "https://app.example.com/base",
      method: "GET",
      path: "/api/surveys",
      input: {},
    });
    expect(url).toBe("https://app.example.com/api/surveys");
  });
});
