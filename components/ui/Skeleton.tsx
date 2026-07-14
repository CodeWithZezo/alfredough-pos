import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded skeleton-shimmer', className)}
      aria-hidden="true"
    />
  )
}

interface TableRowSkeletonProps {
  rows?: number
  cols?: number
}

export function TableRowSkeleton({ rows = 5, cols = 4 }: TableRowSkeletonProps) {
  return (
    <tbody role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton
                className={cn(
                  'h-4',
                  j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-24'
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
