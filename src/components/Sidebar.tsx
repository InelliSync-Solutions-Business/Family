import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { LayoutDashboard, Archive, User, Settings, BarChart } from 'lucide-react'
import { Avatar, AvatarFallback } from './ui/avatar'
import { useAuth } from '@/hooks/useAuth'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <nav className="w-64 border-r bg-warm-100 p-4">
      <div className="mb-8 flex items-center gap-2">
        <Avatar>
          <AvatarFallback className="bg-warm-600 text-warm-50">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'F'}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-serif text-xl text-warm-800">Family Archive</h2>
      </div>
      
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard/personal">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Personal Space
          </Link>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard/shared">
            <Archive className="mr-2 h-4 w-4" />
            Family Hub
          </Link>
        </Button>
        
        {user?.role === 'admin' && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/dashboard/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
        )}
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </nav>
  )
}
