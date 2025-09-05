import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import api, { endpoints } from '../utils/api'

interface Service {
  _id: string
  name: string

  description?: string
}

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
  services: string[]
  workingHours: {
    [key: string]: Array<{ start: string; end: string }>
  }
  timezone: string
  active: boolean
  geo?: {
    lat: number
    lng: number
  }
}

interface TimeSlot {
  start: string
  end: string
  status: 'free' | 'pending' | 'full'
  time: string
}

const MagazinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [magazin, setMagazin] = useState<Magazin | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [availability, setAvailability] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchMagazinDetails()
      fetchServices()
    }
  }, [id])

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability()
    }
  }, [selectedService, selectedDate])

  const fetchMagazinDetails = async () => {
    try {
      const response = await api.get(endpoints.magazins.get(id!))
      if (response.ok) {
        const data = await response.json()
        setMagazin(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching magazin details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await api.get(endpoints.services.list)
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchAvailability = async () => {
    if (!selectedService || !selectedDate) return
    
    try {
      setAvailabilityLoading(true)
      const response = await api.get(`${endpoints.magazins.availability(id!)}?date=${selectedDate}&serviceId=${selectedService}`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-500 hover:bg-green-600'
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'full':
        return 'bg-gray-400 cursor-not-allowed'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'free':
        return t('appointments.status.free')
      case 'pending':
        return t('appointments.status.pending')
      case 'full':
        return t('appointments.status.full')
      default:
        return t('booking.unknown')
    }
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'free') {
      navigate(`/book?magazinId=${id}&serviceId=${selectedService}&date=${selectedDate}&time=${slot.start}`)
    }
  }

  const magazinServiceIds = new Set(
    (magazin?.services || []).map((s: any) => (typeof s === 'string' ? s : s?._id))
  )

  const serviceOptions = services
    .filter(service => magazinServiceIds.has(service._id))
    .map(service => ({ value: service._id, label: service.name }))



  const getDayName = (day: string) => {
    const dayNames: { [key: string]: string } = {
      mon: t('workingHours.monday'),
      tue: t('workingHours.tuesday'),
      wed: t('workingHours.wednesday'),
      thu: t('workingHours.thursday'),
      fri: t('workingHours.friday'),
      sat: t('workingHours.saturday'),
      sun: t('workingHours.sunday')
    }
    return dayNames[day] || day
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading technical center details...</p>
        </div>
      </div>
    )
  }

  if (!magazin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Center Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">The technical center you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{magazin.name}</h1>
              <p className="text-xl opacity-95">{magazin.city}</p>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                magazin.active 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {magazin.active ? t('appointments.status.active') : t('appointments.status.inactive')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Center Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Center Information */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {t('locations.centerInformation')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('locations.address')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{magazin.address}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('locations.timezone')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{magazin.timezone}</p>
                  </div>
                  {magazin.geo && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('locations.location')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {magazin.geo.lat.toFixed(6)}, {magazin.geo.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('locations.availableServices')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{magazin.services.length} service{magazin.services.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('locations.workingHours')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {Object.entries(magazin.workingHours).map(([day, hours]) => (
                    <div key={day} className={`flex justify-between items-center p-4 rounded-lg border ${
                      hours.length > 0 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          hours.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                          {getDayName(day)}
                        </span>
                      </div>
                      <div className="text-right">
                        {hours.length > 0 ? (
                          <div className="space-y-1">
                            {hours.map((period, index) => (
                              <div key={index} className="text-sm font-medium text-green-700 dark:text-green-300">
                                {period.start} - {period.end}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('locations.closed')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center text-blue-800 dark:text-blue-200">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      {t('locations.timezone')}: {magazin.timezone}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Availability Selection */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('appointments.checkAvailability')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label={t('appointments.form.service')}
                    options={serviceOptions}
                    value={selectedService}
                    onChange={setSelectedService}
                    placeholder={t('appointments.form.selectService')}
                  />
                  <Input
                    label={t('appointments.form.date')}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="primary"
                      onClick={fetchAvailability}
                      disabled={!selectedService || !selectedDate}
                      loading={availabilityLoading}
                      className="w-full"
                    >
                      {t('appointments.checkAvailability')}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Availability Grid */}
            {availability.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t('appointments.form.time')} — {selectedDate}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {availability.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.status === 'full'}
                        className={`
                          p-3 text-sm font-medium text-white rounded-lg transition-colors
                          ${getStatusColor(slot.status)}
                          ${slot.status === 'free' ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
                        `}
                        title={`${slot.time} - ${getStatusText(slot.status)}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>{t('appointments.status.free')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                      <span>{t('appointments.status.pending')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                      <span>{t('appointments.status.full')}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Services */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('common.quickActions')}</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/book?magazinId=${id}`)}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('locations.bookAppointment')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/magazins')}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('locations.viewAllCenters')}
                </Button>
              </CardBody>
            </Card>

            {/* Available Services */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('locations.availableServices')}</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {services
                    .filter(service => magazinServiceIds.has(service._id))
                    .map(service => (
                      <div key={service._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{service.name}</h4>
        
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedService(service._id)
                              setSelectedDate('')
                              setAvailability([])
                            }}
                          >
                            {t('common.select')}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('locations.contactInformation')}</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{magazin.city}</span>
                  </div>
                  <div className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm">{magazin.address}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MagazinDetail
