import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface TableEmptyStateProps extends EmptyStateProps {
  colSpan: number
}

export function TableEmptyState({ colSpan, ...props }: TableEmptyStateProps) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan}>
          <EmptyState {...props} />
        </td>
      </tr>
    </tbody>
  )
}
