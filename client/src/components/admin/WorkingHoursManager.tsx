import React from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface WorkingHour {
  start: string
  end: string
}

interface WorkingHours {
  mon: WorkingHour[]
  tue: WorkingHour[]
  wed: WorkingHour[]
  thu: WorkingHour[]
  fri: WorkingHour[]
  sat: WorkingHour[]
  sun: WorkingHour[]
}

interface WorkingHoursManagerProps {
  workingHours: WorkingHours
  onChange: (workingHours: WorkingHours) => void
}

const dayNames = {
  mon: 'Monday',
  tue: 'Tuesday', 
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday'
}

export const WorkingHoursManager: React.FC<WorkingHoursManagerProps> = ({
  workingHours,
  onChange
}) => {
  const addPeriod = (day: keyof WorkingHours) => {
    const newPeriod: WorkingHour = { start: '08:00', end: '12:00' }
    const updatedHours = {
      ...workingHours,
      [day]: [...workingHours[day], newPeriod]
    }
    onChange(updatedHours)
  }

  const removePeriod = (day: keyof WorkingHours, index: number) => {
    const updatedHours = {
      ...workingHours,
      [day]: workingHours[day].filter((_, i) => i !== index)
    }
    onChange(updatedHours)
  }

  const updatePeriod = (day: keyof WorkingHours, index: number, field: 'start' | 'end', value: string) => {
    const updatedHours = {
      ...workingHours,
      [day]: workingHours[day].map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }
    onChange(updatedHours)
  }

  const toggleDay = (day: keyof WorkingHours) => {
    if (workingHours[day].length === 0) {
      // Add default period if day is closed
      addPeriod(day)
    } else {
      // Close the day
      const updatedHours = {
        ...workingHours,
        [day]: []
      }
      onChange(updatedHours)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Working Hours
      </h3>
      
      {Object.entries(workingHours).map(([day, periods]) => (
        <div key={day} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {dayNames[day as keyof WorkingHours]}
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleDay(day as keyof WorkingHours)}
            >
              {periods.length === 0 ? 'Open' : 'Close'}
            </Button>
          </div>
          
          {periods.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              Closed
            </div>
          ) : (
            <div className="space-y-2">
              {periods.map((period: WorkingHour, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={period.start}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePeriod(day as keyof WorkingHours, index, 'start', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={period.end}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePeriod(day as keyof WorkingHours, index, 'end', e.target.value)}
                    className="w-24"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removePeriod(day as keyof WorkingHours, index)}
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPeriod(day as keyof WorkingHours)}
                className="mt-2"
              >
                + Add Time Period
              </Button>
            </div>
          )}
        </div>
      ))}
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        💡 Set working hours for each day. You can have multiple time periods per day (e.g., morning and afternoon shifts).
      </div>
    </div>
  )
}
