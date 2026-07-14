'use client'

import { cn } from '@/lib/utils'
import { forwardRef, useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leading, trailing, id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    const describedBy = [
      error ? errorId : null,
      hint ? hintId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leading && (
            <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'w-full border rounded-lg py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leading ? 'pl-9' : 'pl-3',
              trailing ? 'pr-9' : 'pr-3',
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400/20',
              props.disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 flex items-center text-gray-400">
              {trailing}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
