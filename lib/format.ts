const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const decimal = new Intl.NumberFormat("en-US");

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnly = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  return decimal.format(n);
}

export function formatCompact(n: number | null | undefined): string {
  if (n == null) return "—";
  if (Math.abs(n) < 1000) return decimal.format(n);
  return compactNumber.format(n);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  if (Math.abs(value) < 0.01) return usdPrecise.format(value);
  return usd.format(value);
}

export function formatPercent(
  value: number | null | undefined,
  options: { digits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const digits = options.digits ?? 1;
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = target.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const seconds = Math.round(diffMs / 1000);

  if (abs < 60_000) return relative.format(seconds, "second");
  if (abs < 3_600_000) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400_000) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 30 * 86_400_000) return relative.format(Math.round(seconds / 86_400), "day");
  if (abs < 365 * 86_400_000)
    return relative.format(Math.round(seconds / (30 * 86_400)), "month");
  return relative.format(Math.round(seconds / (365 * 86_400)), "year");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const target = typeof date === "string" ? new Date(date) : date;
  return dateTime.format(target);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const target = typeof date === "string" ? new Date(date) : date;
  return dateOnly.format(target);
}

export function truncateBytes(input: string, maxBytes: number): {
  text: string;
  truncated: boolean;
  totalBytes: number;
} {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  if (bytes.length <= maxBytes) {
    return { text: input, truncated: false, totalBytes: bytes.length };
  }
  const slice = bytes.slice(0, maxBytes);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return {
    text: decoder.decode(slice),
    truncated: true,
    totalBytes: bytes.length,
  };
}
