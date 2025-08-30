import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import SEO from '../components/SEO'
import api, { endpoints } from '../utils/api'

interface Appointment {
  _id: string
  reference: string
  customer: {
    name: string
    phone: string
    carPlate: string
    notes?: string
  }
  magazin: {
    name: string
    city: string
    address: string
  }
  service: {
    name: string
  
  }
  start: string
  end: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

const BookingStatus: React.FC = () => {
  const { reference } = useParams<{ reference: string }>()
  const { t, i18n } = useTranslation()
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (reference) {
      fetchAppointment()
    }
  }, [reference])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      const response = await api.get(endpoints.appointments.getByReference(reference!))
      
      if (response.ok) {
        const data = await response.json()
        setAppointment(data.data || data)
      } else if (response.status === 404) {
        setError(t('booking.errors.notFound'))
      } else {
        setError(t('booking.errors.fetchFailed'))
      }
    } catch (error) {
      setError(t('booking.errors.network'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('appointments.status.confirmed')
      case 'pending':
        return t('appointments.status.pending')
      case 'cancelled':
        return t('appointments.status.cancelled')
      default:
        return t('booking.unknown')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const locale = i18n.language || undefined
    return date.toLocaleString(locale as any, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusTimeline = (status: string) => {
    const steps = [
      { 
        title: t('booking.timeline.booked.title'), 
        description: t('booking.timeline.booked.desc'),
        completed: true,
        icon: '📅'
      },
      { 
        title: t('booking.timeline.review.title'), 
        description: t('booking.timeline.review.desc'),
        completed: status !== 'pending',
        icon: '👀'
      },
      { 
        title: t('booking.timeline.confirmed.title'), 
        description: t('booking.timeline.confirmed.desc'),
        completed: status === 'confirmed',
        icon: '✅'
      }
    ]

    if (status === 'cancelled') {
      steps.push({
        title: t('booking.timeline.cancelled.title'),
        description: t('booking.timeline.cancelled.desc'),
        completed: true,
        icon: '❌'
      })
    }

    return steps
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-lg text-gray-600 mb-6">{error}</p>
            </CardHeader>
            <CardBody className="text-center">
              <div className="space-y-3">
                <Button variant="primary" asChild>
                  <Link to="/appointments">Book New Appointment</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
                <div className="pt-4 text-sm text-gray-600">
                  <span className="mr-2">Have a reference code?</span>
                  <input
                    type="text"
                    defaultValue={reference || ''}
                    className="px-3 py-2 border rounded-md mr-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim().toUpperCase()
                        if (value) window.location.href = `/booking/${value}`
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = (document.querySelector('input[type="text"]') as HTMLInputElement)
                      const value = input?.value?.trim().toUpperCase()
                      if (value) window.location.href = `/booking/${value}`
                    }}
                  >
                    Check
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const statusTimeline = getStatusTimeline(appointment.status)

  return (
    <>
      <SEO
        title={`${t('booking.status')} - ${appointment.reference} | CarTech Morocco`}
        description={t('booking.hero.reference') + ': ' + appointment.reference}
        keywords="appointment status, car inspection, Morocco, booking reference"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Reservation",
          "reservationId": appointment.reference,
          "reservationStatus": appointment.status,
          "underName": {
            "@type": "Person",
            "name": appointment.customer.name
          },
          "reservationFor": {
            "@type": "Service",
            "name": appointment.service.name
          }
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('appointments.details')}
          </h1>
          <p className="text-xl opacity-95">
            {t('booking.hero.reference')}: <span className="font-mono font-bold bg-white/20 px-3 py-1 rounded">{appointment.reference}</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{t('booking.status')}</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-2">{getStatusText(appointment.status)}</span>
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {statusTimeline.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                        step.completed 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className="text-lg">{step.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${
                          step.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      {index < statusTimeline.length - 1 && (
                        <div className={`w-0.5 h-8 mx-5 ${
                          step.completed ? 'bg-blue-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('booking.info')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.service')}:</span>
                      <p className="text-gray-600">{appointment.service.name}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.duration')}:</span>
  
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.dateTime')}:</span>
                      <p className="text-gray-600">{formatDateTime(appointment.start)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.endTime')}:</span>
                      <p className="text-gray-600">{formatDateTime(appointment.end)}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.bookedOn')}:</span>
                      <p className="text-gray-600">{formatDateTime(appointment.createdAt)}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.reference')}:</span>
                      <p className="text-gray-600 font-mono text-sm">{appointment.reference}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Customer & Location */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('booking.customerDetails')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.name')}:</span>
                    <p className="text-gray-600">{appointment.customer.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.phone')}:</span>
                    <p className="text-gray-600">{appointment.customer.phone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.carPlate')}:</span>
                    <p className="text-gray-600 font-mono">{appointment.customer.carPlate}</p>
                  </div>
                  {appointment.customer.notes && (
                    <div>
                      <span className="font-medium text-gray-700">{t('booking.fields.notes')}:</span>
                      <p className="text-gray-600">{appointment.customer.notes}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('booking.locationDetails')}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.center')}:</span>
                    <p className="text-gray-600">{appointment.magazin.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.city')}:</span>
                    <p className="text-gray-600">{appointment.magazin.city}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('booking.fields.address')}:</span>
                    <p className="text-gray-600 text-sm">{appointment.magazin.address}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{t('booking.quickActions')}</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button variant="primary" asChild className="w-full">
                  <Link to="/appointments">{t('appointments.bookAnother')}</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">{t('appointments.backToHome')}</Link>
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default BookingStatus
