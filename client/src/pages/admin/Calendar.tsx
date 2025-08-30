import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import api, { endpoints } from '../../utils/api'

interface Appointment {
  _id: string
  reference: string
  customer: {
    name: string
    phone: string
    carPlate: string
  }
  magazinId: {
    _id: string
    name: string
    city: string
  }
  serviceId: {
    name: string
  
  }
  start: string
  end: string
  status: 'pending' | 'confirmed' | 'canceled'
}

interface Magazin {
  _id: string
  name: string
  city: string
}

interface TimeSlot {
  time: string
  appointments: Appointment[]
  status: 'free' | 'pending' | 'full'
}

const AdminCalendar: React.FC = () => {
  const { t } = useTranslation()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMagazin, setSelectedMagazin] = useState('')
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  useEffect(() => {
    fetchMagazins()
  }, [])

  useEffect(() => {
    if (selectedMagazin && selectedDate) {
      fetchAppointments()
    }
  }, [selectedMagazin, selectedDate])

  const fetchMagazins = async () => {
    try {
      const response = await api.get(endpoints.magazins.list, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setMagazins(data.data || [])
        if (data.data?.length > 0) {
          setSelectedMagazin(data.data[0]._id)
        }
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
    }
  }

  const fetchAppointments = async () => {
    if (!selectedMagazin || !selectedDate) return
    
    setLoading(true)
    try {
      setError(null)
      const response = await api.get(`/appointments?date=${selectedDate}&magazinId=${selectedMagazin}`, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 8
    const endHour = 18
    const slotDuration = 20 // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotStart = new Date(`${selectedDate}T${time}:00`)
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000)

        const slotAppointments = appointments.filter(apt => {
          const aptStart = new Date(apt.start)
          const aptEnd = new Date(apt.end)
          return aptStart < slotEnd && aptEnd > slotStart
        })

        let status: 'free' | 'pending' | 'full' = 'free'
        if (slotAppointments.length > 0) {
          const hasConfirmed = slotAppointments.some(apt => apt.status === 'confirmed')
          status = hasConfirmed ? 'full' : 'pending'
        }

        slots.push({
          time,
          appointments: slotAppointments,
          status
        })
      }
    }

    return slots
  }

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'full':
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getSlotTextColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'text-green-800 dark:text-green-300'
      case 'pending':
        return 'text-yellow-800 dark:text-yellow-300'
      case 'full':
        return 'text-red-800 dark:text-red-300'
      default:
        return 'text-gray-800 dark:text-gray-300'
    }
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const hourNum = parseInt(hour)
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  const getWeekDates = () => {
    const dates = []
    const currentDate = new Date(selectedDate)
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate)
    if (viewMode === 'day') {
      current.setDate(current.getDate() + (direction === 'next' ? 1 : -1))
    } else {
      current.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
    }
    setSelectedDate(current.toISOString().split('T')[0])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.calendar.loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.calendar.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.calendar.subtitle')}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">{t('admin.calendar.error')}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
            >
              {t('admin.calendar.dismiss')}
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
              <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.calendar.calendarControls')}</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigateDate('prev')}
              >
                ← {t('admin.calendar.previous')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateDate('next')}
              >
                {t('admin.calendar.next')} →
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'day' ? 'primary' : 'outline'}
                onClick={() => setViewMode('day')}
              >
                {t('admin.calendar.dayView')}
              </Button>
              <Button
                variant={viewMode === 'week' ? 'primary' : 'outline'}
                onClick={() => setViewMode('week')}
              >
                {t('admin.calendar.weekView')}
              </Button>
            </div>

            <Select
              label={t('admin.calendar.technicalCenter')}
              value={selectedMagazin}
              onChange={(value) => setSelectedMagazin(value)}
              options={magazins.map((magazin) => ({
                value: magazin._id,
                label: `${magazin.name} - ${magazin.city}`
              }))}
            />

            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {viewMode === 'day' ? (
                new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              ) : (
                `${getWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDates()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {viewMode === 'day' ? t('admin.calendar.dailySchedule') : t('admin.calendar.weeklyOverview')}
          </h2>
        </CardHeader>
        <CardBody>
          {viewMode === 'day' ? (
            <div className="grid grid-cols-1 gap-2">
              {generateTimeSlots().map((slot) => (
                <div
                  key={slot.time}
                  className={`p-4 border rounded-lg ${getSlotColor(slot.status)} ${getSlotTextColor(slot.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{formatTime(slot.time)}</div>
                    <div className="text-sm">
                      {slot.status === 'free' && t('admin.calendar.available')}
                      {slot.status === 'pending' && t('admin.calendar.pending')}
                      {slot.status === 'full' && t('admin.calendar.booked')}
                    </div>
                  </div>
                  
                  {slot.appointments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {slot.appointments.map((apt) => (
                        <div key={apt._id} className="text-sm bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 p-2 rounded">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{apt.customer.name}</div>
                          <div className="text-xs opacity-75 text-gray-700 dark:text-gray-300">
                            {apt.serviceId.name} • {apt.customer.carPlate} • {apt.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {getWeekDates().map((date, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {generateTimeSlots().slice(0, 8).map((slot) => (
                      <div
                        key={slot.time}
                        className={`h-4 rounded ${getSlotColor(slot.status)}`}
                        title={`${slot.time} - ${slot.status}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Legend */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.calendar.legend')}</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">{t('admin.calendar.available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">{t('admin.calendar.pending')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">{t('admin.calendar.booked')}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminCalendar
