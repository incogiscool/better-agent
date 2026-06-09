import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const DEFAULT_API_URL = "https://www.betteragent.dev";

export type Credential = {
  apiUrl: string;
  secretKey: string;
  projectId: string;
  projectName: string;
  clientKey: string;
};

type CredentialsFile = {
  default?: Credential;
};

const CREDENTIALS_DIR = path.join(os.homedir(), ".betteragent");
const CREDENTIALS_PATH = path.join(CREDENTIALS_DIR, "credentials.json");

export function credentialsPath(): string {
  return CREDENTIALS_PATH;
}

async function readFile(): Promise<CredentialsFile> {
  try {
    const raw = await fs.readFile(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(raw) as CredentialsFile;
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return {};
    }
    throw err;
  }
}

async function writeFile(data: CredentialsFile): Promise<void> {
  await fs.mkdir(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
}

export async function readCredential(): Promise<Credential | null> {
  const file = await readFile();
  return file.default ?? null;
}

export async function writeCredential(credential: Credential): Promise<void> {
  const file = await readFile();
  file.default = credential;
  await writeFile(file);
}

export async function clearCredential(): Promise<boolean> {
  try {
    await fs.unlink(CREDENTIALS_PATH);
    return true;
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return false;
    }
    throw err;
  }
}
