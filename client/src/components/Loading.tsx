import React from 'react'
import { useTranslation } from 'react-i18next'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text, 
  fullScreen = false 
}) => {
  const { t } = useTranslation()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return spinner
}

export default Loading
