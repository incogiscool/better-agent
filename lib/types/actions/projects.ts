export type ProjectActionErrors = {
  name?: string[];
  baseUrl?: string[];
  systemPrompt?: string[];
  allowedOrigins?: string[];
};

export type CreateProjectActionState = {
  errors?: ProjectActionErrors;
  message?: string;
  project?: {
    id: string;
    name: string;
    clientKey: string;
    secretKey: string;
  };
};

export type UpdateProjectActionState = {
  errors?: ProjectActionErrors;
  message?: string;
};

export type RegenerateKeysActionState = {
  message?: string;
  credentials?: {
    clientKey: string;
    secretKey: string;
  };
};

export type ByokActionState = {
  error?: string;
  message?: string;
  /** Masked display hint for the saved key, e.g. `sk-ant-…ab12`. */
  masked?: string;
};
