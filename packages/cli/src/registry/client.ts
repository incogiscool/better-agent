import { ApiError, createClient } from "../http/client";

export type RegistryIndexItem = {
  name: string;
  type: string;
  description: string;
};

export type RegistryIndex = {
  items: RegistryIndexItem[];
};

export type RegistryFile = {
  path: string;
  content: string;
  type: string;
};

export type RegistryComponent = {
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
};

export function makeRegistryClient(apiUrl: string) {
  const http = createClient({ baseUrl: apiUrl, secretKey: "" });

  return {
    async fetchIndex(): Promise<RegistryIndex> {
      return http.get<RegistryIndex>("/registry/index.json");
    },

    async fetchComponent(name: string): Promise<RegistryComponent> {
      try {
        return await http.get<RegistryComponent>(`/registry/components/${name}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          throw new Error(
            `Component "${name}" not found in registry. Run with no args to see available components.`,
          );
        }
        throw err;
      }
    },
  };
}
