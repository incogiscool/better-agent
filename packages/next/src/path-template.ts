/**
 * Path templates let a route tool bind schema fields to URL path segments:
 *
 * ```ts
 * path: "/api/v3/surveys/{surveyId}"
 * ```
 *
 * `{surveyId}` is filled from the validated tool input at call time; every
 * other schema field keeps its usual placement (query string for GET, JSON
 * body otherwise). Paths with no placeholders behave exactly as they always
 * have.
 *
 * This module is the single definition of the syntax — the chat engine imports
 * the same parser so a template can never mean one thing at definition time
 * and another at call time.
 */

const PLACEHOLDER_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Extract placeholder names from a path template, in order of appearance.
 * Returns `[]` for a path with no placeholders.
 *
 * Throws on a malformed template — an unclosed or unopened brace, an empty
 * `{}`, a name that isn't a valid identifier, or the same name twice.
 */
export function parsePathTemplate(path: string): string[] {
  const names: string[] = [];
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === "}") {
      throw new Error(
        `Invalid path template "${path}": unmatched "}" at position ${i}.`,
      );
    }

    if (char !== "{") {
      i += 1;
      continue;
    }

    const end = path.indexOf("}", i + 1);
    if (end === -1) {
      throw new Error(
        `Invalid path template "${path}": unclosed "{" at position ${i}.`,
      );
    }

    const name = path.slice(i + 1, end);
    if (name.length === 0) {
      throw new Error(`Invalid path template "${path}": empty placeholder "{}".`);
    }
    if (name.includes("{")) {
      throw new Error(
        `Invalid path template "${path}": nested "{" inside a placeholder.`,
      );
    }
    if (!PLACEHOLDER_NAME.test(name)) {
      throw new Error(
        `Invalid path template "${path}": "{${name}}" is not a valid parameter ` +
          `name. Use letters, digits, and underscores, starting with a letter ` +
          `or underscore.`,
      );
    }
    if (names.includes(name)) {
      throw new Error(
        `Invalid path template "${path}": "{${name}}" appears more than once.`,
      );
    }

    names.push(name);
    i = end + 1;
  }

  return names;
}

/** True when `path` contains at least one placeholder. */
export function hasPathParams(path: string): boolean {
  return parsePathTemplate(path).length > 0;
}
