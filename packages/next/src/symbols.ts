/**
 * Symbol used to tag wrappers returned by `defineServerAction` so the CLI can
 * recover their tool definition by importing the wrapped function. Using a
 * registered symbol (Symbol.for) means CLI and SDK can be different module
 * instances and still agree on the key.
 */
export const TOOL_METADATA: unique symbol = Symbol.for(
  "betteragent.tool-metadata",
);

export type WithToolMetadata<T> = T & {
  readonly [TOOL_METADATA]: ToolMetadata;
};

export type ToolMetadata =
  | RouteMetadata
  | ServerActionMetadata
  | ClientActionMetadata;

export type RouteMetadata = {
  kind: "route";
  name: string;
  method: string;
  path: string;
  description?: string;
  schema: object;
};

export type ServerActionMetadata = {
  kind: "server_action";
  name: string;
  description?: string;
  schema: object;
};

export type ClientActionMetadata = {
  kind: "client_action";
  name: string;
  description?: string;
  schema: object;
};
