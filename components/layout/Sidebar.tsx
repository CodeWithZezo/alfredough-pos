'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, ShoppingCart, Package, Tag,
  Users, ArchiveX, BarChart2, LogOut, UtensilsCrossed
} from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/orders',      label: 'Orders',      icon: ShoppingCart },
  { href: '/products',    label: 'Products',    icon: Package },
  { href: '/categories',  label: 'Categories',  icon: Tag },
  { href: '/customers',   label: 'Customers',   icon: Users },
  { href: '/inventory',   label: 'Inventory',   icon: ArchiveX },
  { href: '/reports',     label: 'Reports',     icon: BarChart2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()
  const { data: session } = useSession()
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((products: { variants: { stock: number; lowStockThreshold: number }[] }[]) => {
        const count = products
          .flatMap(p => p.variants)
          .filter(v => v.stock <= v.lowStockThreshold).length
        setLowStockCount(count)
      })
      .catch(() => {})
  }, [pathname === '/products'])

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="p-5 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-orange-400 to-orange-600 shadow-sm shrink-0">
            <UtensilsCrossed size={19} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight">Alfredough</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">POS System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 px-3 mb-2 mt-1 font-medium">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 pl-[10px]'
                  : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-100 border-l-2 border-transparent pl-[10px]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} className="shrink-0" />
              <span className="font-medium">{label}</span>
              {href === '/products' && lowStockCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                  {lowStockCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-800/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800/50 mb-2">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <span className="text-orange-400 text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-300 truncate">
            {session?.user?.name ?? 'Admin'}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800/70 hover:text-white transition-all duration-150 w-full"
        >
          <LogOut size={16} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
