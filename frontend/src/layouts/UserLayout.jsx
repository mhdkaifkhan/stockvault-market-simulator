import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar  from '../components/common/Topbar'
import { useAuth } from '../context/AuthContext'

export default function UserLayout() {
  const { sidebarCollapsed } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
