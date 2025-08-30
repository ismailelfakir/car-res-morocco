import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { HomeModernIcon, CalendarDaysIcon, BuildingOffice2Icon, WrenchScrewdriverIcon, ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

const AdminNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    {
      path: '/admin',
      label: t('admin.dashboard.title'),
      icon: <HomeModernIcon className="w-5 h-5" />
    },
    {
      path: '/admin/appointments',
      label: t('admin.appointments.title').replace(' Management', ''),
      icon: <CalendarDaysIcon className="w-5 h-5" />
    },
    {
      path: '/admin/magazins',
      label: t('admin.magazins.title').replace(' Management', ''),
      icon: <BuildingOffice2Icon className="w-5 h-5" />
    },
    {
      path: '/admin/services',
      label: t('admin.services.title').replace(' Management', ''),
      icon: <WrenchScrewdriverIcon className="w-5 h-5" />
    },
    {
      path: '/admin/calendar',
      label: t('admin.calendar.title').replace(' View', ''),
      icon: <ChartBarIcon className="w-5 h-5" />
    },
    {
      path: '/admin/reports',
      label: t('admin.reports.title'),
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />
    }
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar space-x-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default AdminNav

