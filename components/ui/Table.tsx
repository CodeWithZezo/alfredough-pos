import { cn } from '@/lib/utils'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 overflow-hidden',
        'shadow-(--shadow-card)',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  )
}

interface TableHeadProps {
  children: React.ReactNode
  className?: string
}
export function TableHead({ children, className }: TableHeadProps) {
  return <thead className={cn('bg-gray-50 border-b border-gray-100', className)}>{children}</thead>
}

interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}
export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  )
}

interface TableBodyProps {
  children: React.ReactNode
  className?: string
}
export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn('divide-y divide-gray-50', className)}>{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}
export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/60',
        className
      )}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children?: React.ReactNode
  className?: string
  colSpan?: number
}
export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={cn('px-4 py-3 text-gray-700 whitespace-nowrap', className)}
    >
      {children}
    </td>
  )
}
