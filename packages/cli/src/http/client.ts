export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type ApiClient = {
  baseUrl: string;
  get<T>(path: string, query?: Record<string, string>): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
};

type ClientOptions = {
  baseUrl: string;
  secretKey: string;
};

function buildUrl(
  baseUrl: string,
  pathname: string,
  query?: Record<string, string>,
): string {
  const url = new URL(pathname, baseUrl);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<{ message: string; data: unknown }> {
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // fall through; body wasn't JSON
  }

  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return { message: (data as { error: string }).error, data };
  }
  return { message: `HTTP ${res.status} ${res.statusText}`, data };
}

export function createClient(options: ClientOptions): ApiClient {
  async function request<T>(
    method: "GET" | "POST",
    pathname: string,
    body?: unknown,
    query?: Record<string, string>,
  ): Promise<T> {
    const url = buildUrl(options.baseUrl, pathname, query);
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${options.secretKey}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const { message, data } = await parseError(res);
      throw new ApiError(message, res.status, data);
    }

    return (await res.json()) as T;
  }

  return {
    baseUrl: options.baseUrl,
    get: (pathname, query) => request("GET", pathname, undefined, query),
    post: (pathname, body) => request("POST", pathname, body),
  };
}
