import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/Login'
import { PersonalPage } from './pages/Personal'
import { SharedPage } from './pages/Shared'
import { SettingsPage } from './pages/SettingsPage'
import { AnalyticsDashboard } from './pages/AnalyticsDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'personal', element: <PersonalPage /> },
      { path: 'shared', element: <SharedPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'analytics', element: <AnalyticsDashboard /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
