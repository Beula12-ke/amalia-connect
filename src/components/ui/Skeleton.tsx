import clsx from "clsx";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={clsx("bg-slate-200 rounded-md animate-pulse", className)} />;
}