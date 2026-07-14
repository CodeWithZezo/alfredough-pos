'use client'

import { useSession } from 'next-auth/react'
import { Bell, Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

export default function Topbar({ title }: { title?: string }) {
  const { data: session } = useSession()
  const { open } = useSidebar()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={open}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center ring-2 ring-orange-200">
            <span className="text-orange-600 text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {session?.user?.name ?? 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
