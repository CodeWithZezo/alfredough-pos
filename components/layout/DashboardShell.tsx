'use client'

import { SidebarProvider, useSidebar } from './SidebarContext'
import Sidebar from './Sidebar'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden animate-fade-in"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      {/* Main content — offset for desktop sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  )
}
