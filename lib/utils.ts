export function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${h % 24}h`);
  parts.push(`${m % 60}m`);
  return parts.join(" ");
}
