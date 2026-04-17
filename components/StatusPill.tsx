interface StatusPillProps {
  label: string;
  variant: "live" | "paper" | "neutral";
}

export default function StatusPill({ label, variant }: StatusPillProps) {
  const styles = {
    live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
    paper:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10",
    neutral:
      "bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-slate-500/10",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-3 py-1
        text-xs font-medium shadow-sm ${styles[variant]}
      `}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {variant === "paper" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
      )}
      {label}
    </span>
  );
}
