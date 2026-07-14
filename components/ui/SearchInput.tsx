'use client'

import { Search, X } from 'lucide-react'
import { Input } from './Input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leading={<Search className="w-4 h-4" />}
        trailing={
          value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null
        }
        className="pr-9"
      />
    </div>
  )
}
