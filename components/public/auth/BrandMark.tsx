import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-xs font-medium text-foreground"
    >
      <span className="text-primary">&gt;</span>
      <span>betteragent</span>
    </Link>
  );
}
