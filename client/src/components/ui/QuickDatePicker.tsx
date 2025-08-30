import React from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface QuickDatePickerProps {
  onDateSelect: (date: string) => void
  selectedDate: string
  className?: string
}

const QuickDatePicker: React.FC<QuickDatePickerProps> = ({
  onDateSelect,
  selectedDate,
  className = ''
}) => {
  const { t } = useTranslation()
  const getQuickDates = () => {
    const today = dayjs()
    const tomorrow = today.add(1, 'day')
    const nextWeek = today.add(7, 'day')
    const nextMonth = today.add(1, 'month').startOf('month').add(4, 'day') // Premier mercredi du mois prochain

    return [
      {
        label: t('calendar.today'),
        date: today.format('YYYY-MM-DD'),
        icon: '🌟',
        description: today.format('MMM D'),
        isToday: true
      },
      {
        label: t('calendar.tomorrow'),
        date: tomorrow.format('YYYY-MM-DD'),
        icon: '🚀',
        description: tomorrow.format('MMM D'),
        isToday: false
      },
      {
        label: t('calendar.nextWeek'),
        date: nextWeek.format('YYYY-MM-DD'),
        icon: '📅',
        description: nextWeek.format('MMM D'),
        isToday: false
      },
      {
        label: t('calendar.nextMonth'),
        date: nextMonth.format('YYYY-MM-DD'),
        icon: '📆',
        description: nextMonth.format('MMM D'),
        isToday: false
      }
    ]
  }

  const quickDates = getQuickDates()

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('calendar.quickSelection')}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {quickDates.map((quickDate) => {
          const isSelected = selectedDate === quickDate.date
          const isPast = dayjs(quickDate.date).isBefore(dayjs(), 'day')
          
          return (
            <button
              key={quickDate.date}
              onClick={() => onDateSelect(quickDate.date)}
              disabled={isPast}
              className={`
                relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-center group
                ${isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }
                ${isPast
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-md hover:scale-105'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                text-2xl sm:text-3xl mb-2 transition-transform duration-300
                ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
              `}>
                {quickDate.icon}
              </div>
              
              {/* Label */}
              <div className={`
                text-xs sm:text-sm font-semibold mb-1 transition-colors duration-300
                ${isSelected
                  ? 'text-purple-700 dark:text-purple-200'
                  : 'text-gray-700 dark:text-gray-200'
                }
              `}>
                {quickDate.label}
              </div>
              
              {/* Date */}
              <div className={`
                text-xs transition-colors duration-300
                ${isSelected
                  ? 'text-purple-600 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {quickDate.description}
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Today Badge */}
              {quickDate.isToday && (
                <div className="absolute -top-1 -left-1">
                  <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full shadow-lg">
                    NOW
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickDatePicker
