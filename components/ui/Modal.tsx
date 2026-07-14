'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: keyof typeof sizeClasses
  children: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full p-6 bg-white rounded-2xl shadow-(--shadow-modal)',
            'animate-slide-up',
            'focus:outline-none',
            sizeClasses[size],
            className
          )}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {(title || description) && (
            <div className="mb-5">
              {title && (
                <Dialog.Title className="text-base font-semibold text-gray-900">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description
                  id="modal-description"
                  className="mt-1 text-sm text-gray-500"
                >
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}
          <Dialog.Close
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}
export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}
export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2 mt-6', className)}>
      {children}
    </div>
  )
}
