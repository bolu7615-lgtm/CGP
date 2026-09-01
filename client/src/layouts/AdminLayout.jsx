import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import DashboardHeader from '../components/DashboardHeader'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-cgp-dark flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}