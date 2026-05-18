import type { ZodType } from "zod";
import type {
  ClientActionMetadata,
  RouteMetadata,
  ServerActionMetadata,
} from "./symbols";

/**
 * HTTP method, matching the set we send to /v1/sync as route tools.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * A schema can be either a Zod schema (which the SDK converts via
 * `z.toJSONSchema`) or a JSON Schema object passed through as-is.
 */
export type ToolSchema<TInput = unknown> =
  | ZodType<TInput>
  | Record<string, unknown>;

export type RouteOptions<TInput> = {
  name: string;
  method: HttpMethod;
  path: string;
  description?: string;
  schema: ToolSchema<TInput>;
};

export type ServerActionOptions<TInput, TOutput> = {
  name: string;
  description?: string;
  schema: ToolSchema<TInput>;
  handler: (input: TInput) => Promise<TOutput> | TOutput;
};

export type ClientActionOptions<TInput> = {
  name: string;
  description?: string;
  schema: ToolSchema<TInput>;
};

export type RouteDefinition = RouteMetadata;
export type ClientActionDefinition = ClientActionMetadata;

/**
 * A server action definition is a callable wrapper around the user's handler.
 * Calling it validates input (when a Zod schema is provided) before
 * delegating. The CLI reads tool metadata via the `TOOL_METADATA` symbol.
 */
export type ServerActionDefinition<TInput, TOutput> = ((
  input: TInput,
) => Promise<TOutput>) & {
  readonly betteragent: ServerActionMetadata;
};
