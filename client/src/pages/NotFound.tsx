import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-gray-400 text-8xl mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('notFound.title')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('notFound.message')}
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('notFound.goHome')}
          </Link>
          <Link
            to="/magazins"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('notFound.browseMagazins')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
