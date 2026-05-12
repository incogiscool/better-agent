export function OrDivider({ label = "OR WITH EMAIL" }: { label?: string }) {
  return (
    <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
      {label}
    </div>
  );
}
