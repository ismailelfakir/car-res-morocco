import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminData } from '../../contexts/AdminDataContext'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import SEO from '../../components/SEO'
import { ClipboardDocumentListIcon, CheckCircleIcon, UsersIcon, WrenchScrewdriverIcon, ArrowPathIcon, XCircleIcon, ChartBarIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'

interface DashboardStats {
  today: {
    total: number
    pending: number
    confirmed: number
    cancelled: number
  }
  tomorrow: {
    total: number
    pending: number
    confirmed: number
    cancelled: number
  }
  overall: {
    totalAppointments: number
    totalServices: number
    totalMagazins: number
    totalCustomers: number
  }
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { data, refreshData } = useAdminData()

  // Calculate stats from centralized data
  const processAppointments = (appointments: any[]) => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    }
  }

  // Get unique customers from all appointments
  const uniqueCustomers = new Set(data.appointments.map((apt: any) => apt.customer?.phone) || [])

  const stats: DashboardStats = {
    today: processAppointments(data.todayAppointments),
    tomorrow: processAppointments(data.tomorrowAppointments),
    overall: {
      totalAppointments: data.appointments.length,
      totalServices: data.services.length,
      totalMagazins: data.magazins.length,
      totalCustomers: uniqueCustomers.size
    }
  }

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  )

  if (data.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Admin Dashboard - CarTech Morocco"
        description="Admin dashboard for managing car inspection services, appointments, and technical centers"
        keywords="admin dashboard, car inspection management, Morocco"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "CarTech Morocco Admin Dashboard",
          "description": "Admin dashboard for managing car inspection services",
          "applicationCategory": "BusinessApplication"
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('admin.dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshData}>
            <span className="inline-flex items-center gap-2"><ArrowPathIcon className="w-4 h-4" /> Refresh</span>
          </Button>
          <Button variant="outline" onClick={logout}>
            {t('auth.logout')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {data.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">Error loading dashboard</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{data.error}</p>
            </div>
            <button onClick={refreshData} className="ml-auto text-red-600 dark:text-red-400 hover:underline text-sm font-medium">Retry</button>
          </div>
        </div>
      )}



      {/* Today's Stats */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('time.today')}'s Overview</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title={t('admin.dashboard.stats.totalAppointments')}
              value={stats.today.total}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
              icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.pending')}
              value={stats.today.pending}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
              icon={<ArrowPathIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.confirmed')}
              value={stats.today.confirmed}
              color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
              icon={<CheckCircleIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.cancelled')}
              value={stats.today.cancelled}
              color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
              icon={<XCircleIcon className="w-5 h-5" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Tomorrow's Stats */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('time.tomorrow')}'s Overview</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title={t('admin.dashboard.stats.totalAppointments')}
              value={stats.tomorrow.total}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
              icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.pending')}
              value={stats.tomorrow.pending}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
              icon={<ArrowPathIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.confirmed')}
              value={stats.tomorrow.confirmed}
              color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
              icon={<CheckCircleIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('appointments.status.cancelled')}
              value={stats.tomorrow.cancelled}
              color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
              icon={<XCircleIcon className="w-5 h-5" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Overall System Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('admin.dashboard.summary')}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title={t('admin.dashboard.stats.totalAppointments')}
              value={stats.overall.totalAppointments}
              color="bg-indigo-600 dark:text-indigo-300"
              icon={<ChartBarIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('admin.dashboard.stats.totalServices')}
              value={stats.overall.totalServices}
              color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
              icon={<WrenchScrewdriverIcon className="w-5 h-5" />}
            />
            <StatCard
              title={t('admin.dashboard.stats.totalCenters')}
              value={stats.overall.totalMagazins}
              color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
              icon={<BuildingOffice2Icon className="w-5 h-5" />}
            />
            <StatCard
              title={t('admin.dashboard.stats.totalCustomers')}
              value={stats.overall.totalCustomers}
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
              icon={<UsersIcon className="w-5 h-5" />}
            />
          </div>
        </CardBody>
      </Card>
      </div>
    </>
  )
}

export default AdminDashboard
