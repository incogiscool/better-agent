import Link from "next/link";

interface BrandMarkProps {
  href?: string;
}

export function BrandMark({ href = "/" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs font-medium text-foreground"
    >
      <span className="text-primary">&gt;</span>
      <span>betteragent</span>
    </Link>
  );
}
