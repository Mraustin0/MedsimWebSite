import { cn } from './cn'

/* ── Base pulse skeleton block ──────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-on-surface/6',
        className
      )}
    />
  )
}

/* ── Dashboard tab skeleton ─────────────────────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div className="px-5 py-4 lg:px-10 lg:py-10 space-y-6 animate-fade-in">
      {/* Heading */}
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl p-4 lg:p-7 space-y-3 border border-outline-variant/5">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <Skeleton className="h-48 w-full rounded-3xl" />
      {/* Row cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
            <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Scenario card skeleton ─────────────────────────────────────────────── */
export function ScenarioCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-4 border border-outline-variant/5">
      <div className="flex items-start justify-between">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  )
}

/* ── Student row skeleton ───────────────────────────────────────────────── */
export function StudentRowSkeleton() {
  return (
    <div className="w-full grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 lg:py-5 border-b border-outline-variant/5">
      <div className="col-span-8 lg:col-span-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36 hidden lg:block" />
        </div>
      </div>
      <div className="col-span-4 lg:col-span-2 flex justify-center items-center">
        <Skeleton className="h-6 w-8" />
      </div>
      <div className="hidden lg:flex lg:col-span-2 justify-center items-center">
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="hidden lg:flex lg:col-span-2 justify-center items-center">
        <Skeleton className="h-5 w-10" />
      </div>
      <div className="hidden lg:flex lg:col-span-2 justify-center items-center">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

/* ── Performance view skeleton ──────────────────────────────────────────── */
export function PerformanceSkeleton() {
  return (
    <div className="px-5 py-6 lg:px-10 lg:py-10 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-52" />
      </div>
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 space-y-3 border border-outline-variant/5">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  )
}
