import React from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface SelectedDateInfoProps {
  selectedDate: string
  workingDays?: string[]
  className?: string
}

const SelectedDateInfo: React.FC<SelectedDateInfoProps> = ({
  selectedDate,
  workingDays = ['mon', 'tue', 'wed', 'thu', 'fri'],
  className = ''
}) => {
  const { t } = useTranslation()
  if (!selectedDate) return null

  const date = dayjs(selectedDate)
  const today = dayjs()
  const isToday = date.isSame(today, 'day')
  const isTomorrow = date.isSame(today.add(1, 'day'), 'day')

  const isWeekend = date.day() === 0 || date.day() === 6
  const dayOfWeek = date.format('dddd')
  const monthYear = date.format('MMMM YYYY')
  const dayNumber = date.date()
  const daysUntil = date.diff(today, 'day')
  
  const getDayStatus = () => {
    if (isToday) return { text: t('calendar.today'), color: 'bg-blue-500', textColor: 'text-blue-500' }
    if (isTomorrow) return { text: t('calendar.tomorrow'), color: 'bg-green-500', textColor: 'text-green-500' }
    if (daysUntil <= 7) return { text: t('dateInfo.daysUntil', { days: daysUntil }), color: 'bg-purple-500', textColor: 'text-purple-500' }
    if (daysUntil <= 30) return { text: t('dateInfo.weeksUntil', { weeks: Math.ceil(daysUntil / 7) }), color: 'bg-orange-500', textColor: 'text-orange-500' }
    return { text: t('dateInfo.monthsUntil', { months: Math.ceil(daysUntil / 30) }), color: 'bg-gray-500', textColor: 'text-gray-500' }
  }

  const getWorkingStatus = () => {
    const dayAbbr = date.format('ddd').toLowerCase().substring(0, 3)
    const isWorkingDay = workingDays.includes(dayAbbr)
    
    if (isWeekend) return { text: t('calendar.weekend'), color: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400' }
    if (isWorkingDay) return { text: t('dateInfo.workingDay'), color: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' }
    return { text: t('calendar.nonWorkingDay'), color: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400' }
  }

  const dayStatus = getDayStatus()
  const workingStatus = getWorkingStatus()

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700 p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">📅</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t('dateInfo.selectedDate')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {monthYear}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${dayStatus.color} text-white shadow-sm`}>
          {dayStatus.text}
        </div>
      </div>

      {/* Date Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Large Date Display */}
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
          <div className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {dayNumber}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {dayOfWeek}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {date.format('MMM YYYY')}
          </div>
        </div>

        {/* Date Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dateInfo.dayType')}:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${workingStatus.color} ${workingStatus.textColor}`}>
              {workingStatus.text}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dateInfo.daysUntil')}:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {daysUntil === 0 ? t('calendar.today') : t('dateInfo.daysCount', { count: daysUntil })}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dateInfo.week')}:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('dateInfo.weekNumber', { week: Math.ceil(date.date() / 7) })}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dateInfo.quarter')}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Q{Math.ceil(date.month() / 3)}
          </div>
        </div>
        
        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dateInfo.dayOfYear')}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {date.diff(date.startOf('year'), 'day') + 1}
          </div>
        </div>
        
        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dateInfo.weekday')}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {date.day()}
          </div>
        </div>
        
        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dateInfo.month')}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {date.month() + 1}
          </div>
        </div>
      </div>

      {/* Special Indicators */}
      {(isToday || isTomorrow || isWeekend) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-2">
            {isToday && (
              <>
                <span className="text-lg">🌟</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('dateInfo.perfectForBooking')}
                </span>
              </>
            )}
            {isTomorrow && (
              <>
                <span className="text-lg">🚀</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('dateInfo.greatForPlanning')}
                </span>
              </>
            )}
            {isWeekend && (
              <>
                <span className="text-lg">🏖️</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('dateInfo.checkAvailability')}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectedDateInfo
