'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserSync } from '@/hooks/useUserSync'
import ErrorBoundary from '@/components/ui/error-boundary'
import { NavigationErrorBoundary, PageErrorBoundary } from '@/components/ui/error-boundaries'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Calendar,
  Package,
  Settings,
  BarChart3,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Quotes', href: '/dashboard/quotes', icon: FileText },
  { name: 'Scheduler', href: '/dashboard/scheduler', icon: Calendar },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useUserSync() // Automatically sync user when component mounts

  const NavigationItems = ({ mobile = false }: { mobile?: boolean }) => (
    <ul role="list" className="flex flex-1 flex-col gap-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`
                group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900/80" aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                Axion
              </Link>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4">
              <NavigationErrorBoundary>
                <NavigationItems mobile />
              </NavigationErrorBoundary>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:shadow-sm">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Axion
          </Link>
        </div>
        <nav className="flex flex-1 flex-col px-4 py-4">
          <NavigationErrorBoundary>
            <NavigationItems />
          </NavigationErrorBoundary>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <PageErrorBoundary>
              {children}
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}