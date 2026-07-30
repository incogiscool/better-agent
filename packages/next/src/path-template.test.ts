import { describe, expect, test } from "bun:test";
import { hasPathParams, parsePathTemplate } from "./path-template";

describe("parsePathTemplate", () => {
  test("returns an empty list for a path with no placeholders", () => {
    expect(parsePathTemplate("/api/v3/surveys")).toEqual([]);
    expect(hasPathParams("/api/v3/surveys")).toBe(false);
  });

  test("extracts placeholders in order", () => {
    expect(
      parsePathTemplate("/api/v3/surveys/{surveyId}/responses/{responseId}"),
    ).toEqual(["surveyId", "responseId"]);
    expect(hasPathParams("/api/v3/surveys/{surveyId}")).toBe(true);
  });

  test("accepts underscores and digits in names", () => {
    expect(parsePathTemplate("/api/{_id2}")).toEqual(["_id2"]);
  });

  test("rejects an unclosed brace", () => {
    expect(() => parsePathTemplate("/api/surveys/{surveyId")).toThrow(
      /unclosed/,
    );
  });

  test("rejects an unmatched closing brace", () => {
    expect(() => parsePathTemplate("/api/surveys/surveyId}")).toThrow(
      /unmatched/,
    );
  });

  test("rejects an empty placeholder", () => {
    expect(() => parsePathTemplate("/api/surveys/{}")).toThrow(/empty/);
  });

  test("rejects a name that isn't an identifier", () => {
    expect(() => parsePathTemplate("/api/surveys/{survey-id}")).toThrow(
      /not a valid parameter name/,
    );
    expect(() => parsePathTemplate("/api/surveys/{2id}")).toThrow(
      /not a valid parameter name/,
    );
  });

  test("rejects a duplicate placeholder", () => {
    expect(() => parsePathTemplate("/api/{id}/child/{id}")).toThrow(
      /more than once/,
    );
  });

  test("rejects a nested brace", () => {
    expect(() => parsePathTemplate("/api/{a{b}}")).toThrow(/nested/);
  });
});
