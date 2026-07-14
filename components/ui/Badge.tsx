import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'returned'
  | 'active'
  | 'inactive'
  | 'low'
  | 'ok'
  | 'neutral'
  | 'blue'
  | 'purple'

const variantStyles: Record<BadgeVariant, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  returned:  'bg-purple-100 text-purple-700',
  active:    'bg-green-100 text-green-700',
  inactive:  'bg-gray-100 text-gray-500',
  low:       'bg-red-100 text-red-600',
  ok:        'bg-green-100 text-green-700',
  neutral:   'bg-blue-100 text-blue-700',
  blue:      'bg-blue-100 text-blue-700',
  purple:    'bg-purple-100 text-purple-700',
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export type { BadgeVariant }
