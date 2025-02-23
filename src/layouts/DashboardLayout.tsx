import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-warm-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
