import React, { useState, useEffect } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  minDate?: string
  maxDate?: string
  disabledDates?: string[]
  workingDays?: string[]
  className?: string
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date().toISOString().split('T')[0],

  disabledDates = [],
  workingDays = ['mon', 'tue', 'wed', 'thu', 'fri'],
  className = ''
}) => {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(dayjs(selectedDate))
    }
  }, [selectedDate])

  const getDaysInMonth = (date: dayjs.Dayjs) => {
    const start = date.startOf('month')
    const end = date.endOf('month')
    const startDate = start.startOf('week')
    const endDate = end.endOf('week')
    const days = []
    let current = startDate

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current)
      current = current.add(1, 'day')
    }

    return days
  }

  const isDateDisabled = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const isPast = date.isBefore(dayjs(), 'day')
    const isDisabled = disabledDates.includes(dateStr)
    const isWorkingDay = workingDays.includes(date.format('ddd').toLowerCase().substring(0, 3))
    
    return isPast || isDisabled || !isWorkingDay
  }

  const isDateSelected = (date: dayjs.Dayjs) => {
    return selectedDate === date.format('YYYY-MM-DD')
  }

  const isDateHovered = (date: dayjs.Dayjs) => {
    return hoveredDate === date.format('YYYY-MM-DD')
  }

  const handleDateClick = (date: dayjs.Dayjs) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date.format('YYYY-MM-DD'))
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'))
  }

  const goToToday = () => {
    const today = dayjs()
    if (!today.isBefore(dayjs(minDate), 'day')) {
      onDateSelect(today.format('YYYY-MM-DD'))
      setCurrentMonth(today)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentMonth.format('MMMM YYYY')}
          </h3>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
          >
            {t('calendar.today')}
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {weekDays.map(day => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 p-3 text-center"
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {days.map((date, index) => {
          const isCurrentMonth = date.month() === currentMonth.month()
          const isDisabled = isDateDisabled(date)
          const isSelected = isDateSelected(date)
          const isHovered = isDateHovered(date)
          const isToday = date.isSame(dayjs(), 'day')

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date.format('YYYY-MM-DD'))}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={isDisabled}
              className={`
                relative p-3 text-center transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center
                ${isCurrentMonth 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'bg-gray-50 dark:bg-gray-900'
                }
                ${isDisabled 
                  ? 'cursor-not-allowed opacity-40' 
                  : 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : ''
                }
                ${isHovered && !isDisabled && !isSelected 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'ring-2 ring-blue-300 dark:ring-blue-600' 
                  : ''
                }
              `}
            >
              {/* Date Number */}
              <span className={`
                text-sm font-medium
                ${isCurrentMonth 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-400 dark:text-gray-500'
                }
                ${isSelected 
                  ? 'text-white' 
                  : ''
                }
              `}>
                {date.date()}
              </span>

              {/* Today Indicator */}
              {isToday && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
              )}

              {/* Working Day Indicator */}
              {!isDisabled && isCurrentMonth && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full opacity-60"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Calendar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">{t('calendar.workingDays')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">{t('calendar.selected')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
