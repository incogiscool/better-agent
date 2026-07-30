import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { defineRoute } from "./define";

describe("defineRoute path parameters", () => {
  test("accepts a required string parameter", () => {
    const route = defineRoute({
      name: "getSurvey",
      method: "GET",
      path: "/api/v3/surveys/{surveyId}",
      schema: z.object({ surveyId: z.string() }),
    });
    expect(route.path).toBe("/api/v3/surveys/{surveyId}");
  });

  test("accepts a required number parameter", () => {
    expect(() =>
      defineRoute({
        name: "getPage",
        method: "GET",
        path: "/api/pages/{page}",
        schema: z.object({ page: z.number().int() }),
      }),
    ).not.toThrow();
  });

  test("throws when the placeholder has no matching property", () => {
    expect(() =>
      defineRoute({
        name: "getSurvey",
        method: "GET",
        path: "/api/v3/surveys/{surveyId}",
        schema: z.object({ somethingElse: z.string() }),
      }),
    ).toThrow(/has no matching property/);
  });

  test("throws when the placeholder property is optional", () => {
    expect(() =>
      defineRoute({
        name: "getSurvey",
        method: "GET",
        path: "/api/v3/surveys/{surveyId}",
        schema: z.object({ surveyId: z.string().optional() }),
      }),
    ).toThrow(/must be required/);
  });

  test("throws when the placeholder property is a composite type", () => {
    expect(() =>
      defineRoute({
        name: "getSurvey",
        method: "GET",
        path: "/api/v3/surveys/{surveyId}",
        schema: z.object({ surveyId: z.object({ value: z.string() }) }),
      }),
    ).toThrow(/must be a string or number/);
  });

  test("throws on a malformed template", () => {
    expect(() =>
      defineRoute({
        name: "getSurvey",
        method: "GET",
        path: "/api/v3/surveys/{surveyId",
        schema: z.object({ surveyId: z.string() }),
      }),
    ).toThrow(/unclosed/);
  });

  test("a path with no placeholders is unaffected", () => {
    const route = defineRoute({
      name: "listSurveys",
      method: "GET",
      path: "/api/v3/surveys",
      schema: z.object({ limit: z.number().optional() }),
    });
    expect(route.path).toBe("/api/v3/surveys");
    expect(route.schema).toMatchObject({ type: "object" });
  });

  test("skips validation when the schema carries no properties", () => {
    // A hand-written loose schema, or the permissive fallback `toJsonSchema`
    // produces when Zod conversion fails — nothing to validate against, and
    // throwing here would take down the whole tool file.
    expect(() =>
      defineRoute({
        name: "opaque",
        method: "GET",
        path: "/api/things/{thingId}",
        schema: { type: "object", additionalProperties: true },
      }),
    ).not.toThrow();
  });
});

describe("defineRoute schema conversion", () => {
  test("degrades z.date() to a date-time string instead of throwing", () => {
    const route = defineRoute({
      name: "listResponses",
      method: "GET",
      path: "/api/responses",
      schema: z.object({ since: z.date().optional() }),
    });
    expect(route.schema).toMatchObject({
      properties: { since: { type: "string", format: "date-time" } },
    });
  });
});
