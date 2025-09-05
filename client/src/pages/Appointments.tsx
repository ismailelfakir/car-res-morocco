import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SEO from '../components/SEO'
import api, { endpoints } from '../utils/api'
// Using a lightweight in-page day carousel for date selection

interface Service {
  _id: string
  name: string

}

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
  services: string[]
  active: boolean
}

interface TimeSlot {
  start: string
  end: string
  status: 'free' | 'pending' | 'full'
  time: string
}

const Appointments: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [currentStep, setCurrentStep] = useState(1)

  const [services, setServices] = useState<Service[]>([])
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [filteredMagazins, setFilteredMagazins] = useState<Magazin[]>([])
  const [availability, setAvailability] = useState<TimeSlot[]>([])

  const [magazinSlotDuration, setMagazinSlotDuration] = useState<number | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [, setSuccessReference] = useState('')

  const [serviceId, setServiceId] = useState('')
  const [magazinId, setMagazinId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedStartISO, setSelectedStartISO] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [carPlate, setCarPlate] = useState('')
  const [notes, setNotes] = useState('')

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city))
  }

  const clearAllCities = () => {
    setSelectedCities([])
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [servicesRes, magazinsRes] = await Promise.all([
          api.get(endpoints.services.list),
          api.get(endpoints.magazins.list)
        ])
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          const svc = data.data || []
          setServices(svc)
        }
        if (magazinsRes.ok) {
          const data = await magazinsRes.json()
          const mags = data.data || []
          setMagazins(mags)
          
          // Extract unique cities
          const uniqueCities = [...new Set(mags.map((m: Magazin) => m.city))] as string[]
          setCities(uniqueCities)
        }
      } catch (e) {
        console.error('Error fetching data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Prefill from URL query params
  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams(location.search)
    const qServiceId = params.get('serviceId') || ''
    const qMagazinId = params.get('magazinId') || ''
    const qDate = params.get('date') || ''
    const qTime = params.get('time') || ''

    let nextStep = 1

    if (qServiceId) setServiceId(qServiceId)
    if (qMagazinId) setMagazinId(qMagazinId)

    // If time is an ISO string, derive date and HH:mm
    const tryIso = (() => {
      if (!qTime) return false
      const d = new Date(qTime)
      if (isNaN(d.getTime())) return false
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      setSelectedDate(`${year}-${month}-${day}`)
      setSelectedTime(`${hours}:${minutes}`)
      setSelectedStartISO(`${year}-${month}-${day}T${hours}:${minutes}:00.000`)
      return true
    })()

    if (!tryIso) {
      if (qDate) setSelectedDate(qDate)
      if (qDate && qTime) {
        setSelectedTime(qTime)
        const [hStr, mStr] = qTime.split(':')
        if (hStr && mStr) {
          const iso = `${qDate}T${hStr.padStart(2,'0')}:${mStr.padStart(2,'0')}:00.000`
          setSelectedStartISO(iso)
        }
      }
    }

    if (qServiceId && qMagazinId) nextStep = 2
    if (qServiceId && qMagazinId && (qDate || tryIso)) nextStep = 2
    if (qServiceId && qMagazinId && (qDate || tryIso) && (qTime || tryIso)) nextStep = 3

    setCurrentStep(nextStep)
  }, [location.search, loading])

  // Filter magazins based on selected cities
  useEffect(() => {
    if (selectedCities.length > 0) {
      const filtered = magazins.filter(m => selectedCities.includes(m.city))
      setFilteredMagazins(filtered)
      
      // Clear selected magazin if it's not in the filtered list
      if (magazinId && !filtered.find(m => m._id === magazinId)) {
        setMagazinId('')
      }
    } else {
      setFilteredMagazins(magazins)
    }
  }, [selectedCities, magazins, magazinId])

  // Fetch selected magazin details for working hours
  useEffect(() => {
    const fetchMagazinDetails = async () => {
      if (!magazinId) return
      try {
        const res = await api.get(endpoints.magazins.get(magazinId))
        if (res.ok) {
          const data = await res.json()
          
          const slotDur = (data.data && data.data.slotDurationMinutes) || data.slotDurationMinutes || null
          if (slotDur) setMagazinSlotDuration(slotDur)
        }
      } catch (e) {
        console.error('Error fetching magazin details', e)

      }
    }
    fetchMagazinDetails()
  }, [magazinId])

  useEffect(() => {
    // Reset time when date changes
    setSelectedTime('')
    setSelectedStartISO('')
  }, [selectedDate])

  useEffect(() => {
    // Ensure a default date when entering step 2 (start from tomorrow)
    if (currentStep === 2 && !selectedDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setSelectedDate(formatLocalDate(tomorrow))
    }
  }, [currentStep])

  useEffect(() => {
    // Fetch availability when requirements are ready
    const fetchAvailability = async () => {
      if (!serviceId || !magazinId || !selectedDate) return
      try {
        setAvailabilityLoading(true)
        const res = await api.get(`${endpoints.magazins.availability(magazinId)}?date=${selectedDate}&serviceId=${serviceId}`)
        if (res.ok) {
          const data = await res.json()
          const rawSlots = (data.data && data.data.slots) || data.slots || []
          

          
          const itemsFromServer: TimeSlot[] = rawSlots.map((slot: any) => {
            const start: string = slot.start || ''
            // Parse the time from the slot data
            let timeDisplay = ''
            if (slot.time) {
              // If slot.time exists, use it directly
              timeDisplay = slot.time
            } else if (start) {
              // Parse from start time if available
              try {
                const d = new Date(start)
                if (!isNaN(d.getTime())) {
                  const hours = d.getHours()
                  const minutes = d.getMinutes()
                  const hh = String(hours).padStart(2, '0')
                  const mm = String(minutes).padStart(2, '0')
                  timeDisplay = `${hh}:${mm}`
                }
              } catch (e) {
                console.error('Error parsing date:', start, e)
              }
            }
            
            // Ensure we have a valid time display
            if (!timeDisplay || timeDisplay === 'NaN:NaN') {
              timeDisplay = '--:--' // Fallback for invalid times
            }
            
            // Map backend status to frontend status
            let frontendStatus: 'free' | 'pending' | 'full' = 'free'
            if (slot.available === false || slot.takenCount >= slot.capacity) {
              frontendStatus = 'full'
            } else if (slot.takenCount > 0) {
              // If there are taken appointments but still capacity, show as pending
              frontendStatus = 'pending'
            } else {
              frontendStatus = 'free'
            }
            
            return {
              start: slot.start,
              end: slot.end,
              status: frontendStatus,
              time: timeDisplay
            }
          })

          // Build complete grid based on magazin working hours and slot duration, then overlay server statuses
          const builtGrid = (() => {
            if (!magazinSlotDuration || !selectedDate) {
              // If no working hours, ensure server slots have proper start times
              return itemsFromServer.map(slot => {
                if (!slot.start && slot.time) {
                  // Generate ISO start time from selected date and time
                  const [hours, minutes] = slot.time.split(':').map(Number)
                  const slotDate = new Date(selectedDate)
                  slotDate.setHours(hours, minutes, 0, 0)
                  return { ...slot, start: slotDate.toISOString() }
                }
                return slot
              })
            }
            // Working hours removed, use empty array
            const periods: Array<{ start: string; end: string }> = []
            // If periods are not defined, fall back to server-provided slots
            if (periods.length === 0) return itemsFromServer

            const mapByTime = new Map<string, TimeSlot>()
            for (const s of itemsFromServer) if (s.time) mapByTime.set(s.time, s)

            const out: TimeSlot[] = []
            for (const p of periods) {
              let [h, m] = p.start.split(':').map(Number)
              const [eh, em] = p.end.split(':').map(Number)
              while (h < eh || (h === eh && m < em)) {
                const hh = String(h).padStart(2, '0')
                const mm = String(m).padStart(2, '0')
                const key = `${hh}:${mm}`
                const existing = mapByTime.get(key)
                
                // Generate proper ISO start time for the slot
                const slotDate = new Date(selectedDate)
                slotDate.setHours(h, m, 0, 0)
                // FIXED: Create local time ISO string to avoid timezone conversion
                const year = slotDate.getFullYear()
                const month = String(slotDate.getMonth() + 1).padStart(2, '0')
                const day = String(slotDate.getDate()).padStart(2, '0')
                const hours = String(h).padStart(2, '0')
                const minutes = String(m).padStart(2, '0')
                const isoStart = `${year}-${month}-${day}T${hours}:${minutes}:00.000`
                
                out.push(existing || { 
                  start: isoStart, 
                  end: '', 
                  status: 'free' as const, 
                  time: key 
                })
                m += magazinSlotDuration
                while (m >= 60) { m -= 60; h += 1 }
              }
            }
            return out
          })()

          setAvailability(builtGrid)
        }
      } catch (e) {
        console.error('Error fetching availability', e)
      } finally {
        setAvailabilityLoading(false)
      }
    }
    fetchAvailability()
  }, [serviceId, magazinId, selectedDate])

  const steps = [
    { number: 1, title: t('appointments.steps.serviceLocation.title'), description: t('appointments.steps.serviceLocation.desc') },
    { number: 2, title: t('appointments.steps.schedule.title'), description: t('appointments.steps.schedule.desc') },
    { number: 3, title: t('appointments.steps.personal.title'), description: t('appointments.steps.personal.desc') }
  ]

  const canProceedFromStep1 = serviceId && magazinId
  const canProceedFromStep2 = selectedDate && selectedTime && selectedStartISO
  const isValidPhone = (value: string) => /^([+]?212|0)[5-7][0-9]{8}$/.test(value.replace(/\s/g, ''))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !isValidPhone(phone) || !carPlate.trim() || !canProceedFromStep1 || !canProceedFromStep2) {
      setError(t('appointments.formError'))
      return
    }

    // Ensure we have a valid ISO string
    let startISO = selectedStartISO
    if (!startISO && selectedDate && selectedTime) {
      // Create proper ISO string from date and time
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(hours, minutes, 0, 0)
      // FIXED: Create local time ISO string to avoid timezone conversion
      const year = appointmentDate.getFullYear()
      const month = String(appointmentDate.getMonth() + 1).padStart(2, '0')
      const day = String(appointmentDate.getDate()).padStart(2, '0')
      const hoursStr = String(hours).padStart(2, '0')
      const minutesStr = String(minutes).padStart(2, '0')
      startISO = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00.000`
    }
    

    
    const payload = {
      customer: { name, phone, carPlate, notes },
      magazinId,
      serviceId,
      startISO
    }

    // DEBUG: Log what we're sending to the backend
    console.log('Sending appointment payload:', {
      payload,
      selectedTime,
      selectedStartISO,
      selectedDate,
      startISO
    })

    try {
      setSubmitting(true)
      // @ts-ignore Vite import meta env
      
      const res = await api.post(endpoints.appointments.create, payload)
      if (res.ok) {
        const data = await res.json()
        const ref = data.data?.reference || data.reference
        setSuccessReference(ref)
        // Navigate to booking details for a professional UX
        navigate(`/booking/${ref}`)
        return
      }
      if (res.status === 409) {
        setError(`${t('appointments.slotUnavailable')} The time slot has been updated to show current availability.`)
        // Clear the selected time since it's no longer available
        setSelectedTime('')
        setSelectedStartISO('')
        // CRITICAL: Refresh availability to show the slot as taken
        // This prevents users from seeing stale data
        const refreshAvailability = async () => {
          try {
            setAvailabilityLoading(true)
            const refreshRes = await api.get(`${endpoints.magazins.availability(magazinId)}?date=${selectedDate}&serviceId=${serviceId}`)
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              const rawSlots = (refreshData.data && refreshData.data.slots) || refreshData.slots || []
              
              // Process slots with proper status mapping
              const refreshedSlots: TimeSlot[] = rawSlots.map((slot: any) => {
                const start: string = slot.start || ''
                let timeDisplay = ''
                if (slot.time) {
                  timeDisplay = slot.time
                } else if (start) {
                  try {
                    const d = new Date(start)
                    if (!isNaN(d.getTime())) {
                      const hours = d.getHours()
                      const minutes = d.getMinutes()
                      const hh = String(hours).padStart(2, '0')
                      const mm = String(minutes).padStart(2, '0')
                      timeDisplay = `${hh}:${mm}`
                    }
                  } catch (e) {
                    console.error('Error parsing date:', start, e)
                  }
                }
                
                if (!timeDisplay || timeDisplay === 'NaN:NaN') {
                  timeDisplay = '--:--'
                }
                
                // Map backend status to frontend status
                let frontendStatus: 'free' | 'pending' | 'full' = 'free'
                if (slot.available === false || slot.takenCount >= slot.capacity) {
                  frontendStatus = 'full'
                } else if (slot.takenCount > 0) {
                  // If there are taken appointments but still capacity, show as pending
                  frontendStatus = 'pending'
                } else {
                  frontendStatus = 'free'
                }
                
                return {
                  start: slot.start,
                  end: slot.end,
                  status: frontendStatus,
                  time: timeDisplay
                }
              })
              
              setAvailability(refreshedSlots)
              
              // Highlight the recently taken slot for visual feedback
              if (selectedTime) {
                setRecentlyTakenSlots(prev => new Set([...prev, selectedTime]))
                // Remove the highlight after 5 seconds
                setTimeout(() => {
                  setRecentlyTakenSlots(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(selectedTime)
                    return newSet
                  })
                }, 5000)
              }
              
              // Show notification that availability was updated
              setShowRefreshNotification(true)
              setTimeout(() => setShowRefreshNotification(false), 5000)
            }
          } catch (e) {
            console.error('Error refreshing availability after conflict:', e)
          } finally {
            setAvailabilityLoading(false)
          }
        }
        
        refreshAvailability()
      } else {
        const err = await res.json().catch(() => ({} as any))
        setError(err.message || t('appointments.error'))
      }
    } catch (e) {
      setError(t('appointments.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'full':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'free':
        return 'Available - Click to select'
      case 'pending':
        return 'Partially booked - Limited availability'
      case 'full':
        return 'Fully booked - Not available'
      default:
        return 'Unknown status'
    }
  }

  // Track recently taken slots for visual feedback
  const [recentlyTakenSlots, setRecentlyTakenSlots] = useState<Set<string>>(new Set())
  const [showRefreshNotification, setShowRefreshNotification] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={t('seo.appointments.title')}
        description={t('seo.appointments.description')}
        keywords={t('seo.appointments.keywords')}
        type="service"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ReservationService",
          "name": "Car Technical Inspection Booking",
          "description": t('seo.appointments.description'),
          "provider": {
            "@type": "Organization",
            "name": "CarTech Morocco"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Morocco"
          }
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('appointments.title')}</h1>
          <p className="text-lg opacity-95">{t('appointments.subtitle')}</p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              {/* Step 1: Service & Location */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointments.steps.serviceLocation.title')}</h3>
                  <div className="space-y-6">
                    {/* City Filter */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('appointments.form.filterByCity')}
                      </label>
                      
                      {/* Selected Cities Display */}
                      {selectedCities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCities.map(city => (
                              <span
                                key={city}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              >
                                {city}
                                <button
                                  type="button"
                                  onClick={() => removeCity(city)}
                                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={clearAllCities}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                          >
{t('appointments.form.clearAllCities')}
                          </button>
                        </div>
                      )}

                      {/* Available Cities */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedCities.length === 0 ? t('appointments.form.selectCities') : t('appointments.form.addMoreCities')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cities.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => toggleCity(city)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCities.includes(city)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {city}
                              {selectedCities.includes(city) && (
                                <svg className="w-4 h-4 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Service and Location Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label={t('appointments.form.service')}
                        options={services.map((s) => ({ value: s._id, label: s.name }))}
                        value={serviceId}
                        onChange={setServiceId}
                        placeholder={t('appointments.form.selectService')}
                        required
                        variant="filled"
                        size="md"
                      />
                      <div>
                        <Select
                          label={t('appointments.form.location')}
                          options={filteredMagazins.map((m) => ({ value: m._id, label: `${m.name} - ${m.city}` }))}
                          value={magazinId}
                          onChange={setMagazinId}
                          placeholder={t('appointments.form.selectLocation')}
                          required
                          variant="filled"
                          size="md"
                        />
                        {selectedCities.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {filteredMagazins.length === 0 
                              ? t('appointments.form.noCentersInSelectedCities')
                              : `${filteredMagazins.length} ${t('appointments.form.centersInSelectedCities')}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Show Working Hours for Selected Magazin */}


                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={() => canProceedFromStep1 && setCurrentStep(2)}
                      disabled={!canProceedFromStep1}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointments.form.date')}</h3>
                      {selectedDate && (
                        <div className="mt-2 inline-flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{selectedDate}</span>
                          {selectedTime && (
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">{selectedTime}</span>
                          )}
                          {selectedTime && (
                            <button
                              type="button"
                              onClick={() => setSelectedTime('')}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {t('common.clear')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Day Carousel: next 14 days */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => {
                          // Move selection one day back if not before tomorrow (local)
                          const d = selectedDate ? new Date(selectedDate) : new Date()
                          const prev = new Date(d)
                          prev.setDate(d.getDate() - 1)
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          const tomorrowStr = formatLocalDate(tomorrow)
                          const prevStr = formatLocalDate(prev)
                          if (prevStr >= tomorrowStr) setSelectedDate(prevStr)
                        }}
                        aria-label={t('appointments.previousDay')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <div className="overflow-x-auto no-scrollbar">
                        <div className="flex gap-2">
                          {Array.from({ length: 14 }).map((_, i) => {
                            const base = new Date()
                            base.setHours(0,0,0,0)
                            base.setDate(base.getDate() + i + 1) // Start from tomorrow (i + 1)
                            const dateStr = formatLocalDate(base)
                            const selected = selectedDate === dateStr
                            const label = base.toLocaleDateString(undefined, { weekday: 'short' })
                            const dayNum = base.getDate()
                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setSelectedDate(dateStr)}
                                className={`min-w-[84px] px-3 py-2 rounded-xl border text-left transition ${
                                  selected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-200'
                                    : 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="text-xs opacity-70 dark:opacity-60">{label}</div>
                                <div className="text-lg font-semibold">{dayNum}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => {
                          const d = selectedDate ? new Date(selectedDate) : new Date()
                          const next = new Date(d)
                          next.setDate(d.getDate() + 1)
                          setSelectedDate(formatLocalDate(next))
                        }}
                        aria-label={t('appointments.nextDay')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{t('appointments.form.time')}</h4>
                      
                      {/* Status Legend and Counts */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Partially Booked</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Fully Booked</span>
                          </div>
                        </div>
                        
                        {/* Slot Counts */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-green-600">{availability.filter(s => s.status === 'free').length}</span> available • 
                          <span className="font-medium text-yellow-500 ml-1">{availability.filter(s => s.status === 'pending').length}</span> partial • 
                          <span className="font-medium text-red-500 ml-1">{availability.filter(s => s.status === 'full').length}</span> full
                        </div>
                      </div>
                      {availabilityLoading ? (
                        <div className="text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
                      ) : availability.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                          {availability.map((slot, idx) => (
                            <button
                              key={idx}
                              onClick={async () => {
                                if (slot.status !== 'free') return
                                
                                // Double-check availability before allowing selection
                                try {
                                  const checkRes = await api.get(`${endpoints.magazins.availability(magazinId)}?date=${selectedDate}&serviceId=${serviceId}`)
                                  if (checkRes.ok) {
                                    const checkData = await checkRes.json()
                                    const currentSlots = checkData.data?.slots || checkData.slots || []
                                    const currentSlot = currentSlots.find((s: any) => s.time === slot.time)
                                    
                                    if (!currentSlot || !currentSlot.available) {
                                      setError(t('appointments.slotUnavailable'))
                                      // Refresh availability to show current state
                                      const fetchAvailability = async () => {
                                        try {
                                          setAvailabilityLoading(true)
                                          const res = await api.get(`${endpoints.magazins.availability(magazinId)}?date=${selectedDate}&serviceId=${serviceId}`)
                                          if (res.ok) {
                                            const data = await res.json()
                                                        const rawSlots = (data.data && data.data.slots) || data.slots || []
            
            // Debug: Log the raw slot data to see what backend sends
            console.log('Raw slots from backend:', rawSlots)
            
            // Process slots as before...
            const itemsFromServer: TimeSlot[] = rawSlots.map((slot: any) => {
                                              const start: string = slot.start || ''
                                              let timeDisplay = ''
                                              if (slot.time) {
                                                timeDisplay = slot.time
                                              } else if (start) {
                                                try {
                                                  const d = new Date(start)
                                                  if (!isNaN(d.getTime())) {
                                                    const hours = d.getHours()
                                                    const minutes = d.getMinutes()
                                                    const hh = String(hours).padStart(2, '0')
                                                    const mm = String(minutes).padStart(2, '0')
                                                    timeDisplay = `${hh}:${mm}`
                                                  }
                                                } catch (e) {
                                                  console.error('Error parsing date:', start, e)
                                                }
                                              }
                                              
                                              if (!timeDisplay || timeDisplay === 'NaN:NaN') {
                                                timeDisplay = '--:--'
                                              }
                                              
                                              let frontendStatus: 'free' | 'pending' | 'full' = 'free'
                                              if (slot.available === false || slot.takenCount >= slot.capacity) {
                                                frontendStatus = 'full'
                                              } else if (slot.takenCount > 0) {
                                                // If there are taken appointments but still capacity, show as pending
                                                frontendStatus = 'pending'
                                              } else {
                                                frontendStatus = 'free'
                                              }
                                              
                                              return {
                                                start: slot.start,
                                                end: slot.end,
                                                status: frontendStatus,
                                                time: timeDisplay
                                              }
                                            })
                                            setAvailability(itemsFromServer)
                                          }
                                        } catch (e) {
                                          console.error('Error refreshing availability', e)
                                        } finally {
                                          setAvailabilityLoading(false)
                                        }
                                      }
                                      fetchAvailability()
                                      return
                                    }
                                  }
                                } catch (e) {
                                  console.error('Error checking slot availability:', e)
                                }
                                
                                // Slot is available, proceed with selection
                                setSelectedTime(slot.time)
                                setSelectedStartISO(slot.start)
                                setError('') // Clear any previous errors
                              }}
                              disabled={slot.status !== 'free'}
                              className={`p-3 rounded-lg text-sm font-medium transition ${getStatusColor(slot.status)} ${
                                selectedStartISO === slot.start ? 'ring-2 ring-offset-2 ring-blue-300 dark:ring-offset-gray-900 shadow-lg' : ''
                              } ${slot.status !== 'free' ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'} ${
                                recentlyTakenSlots.has(slot.time) ? 'animate-pulse ring-2 ring-red-400' : ''
                              }`}
                              title={`${slot.time} - ${getStatusText(slot.status)}`}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{slot.time}</span>
                                {slot.status === 'free' && (
                                  <svg className="w-3 h-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {slot.status === 'pending' && (
                                  <svg className="w-3 h-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {slot.status === 'full' && (
                                  <svg className="w-3 h-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : selectedDate ? (
                        <div className="text-gray-600 dark:text-gray-300">{t('appointments.noSlots')}</div>
                      ) : (
                        <div className="text-gray-600 dark:text-gray-300">{t('appointments.selectDateFirst')}</div>
                      )}
                    </div>

                    {/* Navigation buttons at bottom of Step 2 */}
                    <div className="flex justify-between pt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        {t('common.back')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => canProceedFromStep2 && setCurrentStep(3)}
                        disabled={!canProceedFromStep2}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Info */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appointments.form.title')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('appointments.form.name')}
                      placeholder={t('appointments.form.name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      variant="filled"
                      size="md"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                    <Input
                      label={t('appointments.form.phone')}
                      placeholder={t('appointments.form.phone')}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      variant="filled"
                      size="md"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                      helperText="Format: +212 6 12 34 56 78 or 06 12 34 56 78"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('appointments.form.carPlate')}
                      placeholder={t('appointments.form.carPlate')}
                      value={carPlate}
                      onChange={(e) => setCarPlate(e.target.value)}
                      required
                      variant="filled"
                      size="md"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      }
                    />
                    <Input
                      label={t('appointments.form.notes')}
                      placeholder={t('appointments.form.notes')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      variant="filled"
                      size="md"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.2l8.586-8.586z" />
                        </svg>
                      }
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                      </div>
                    </div>
                  )}

                  {showRefreshNotification && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-blue-800 dark:text-blue-200">Availability updated! The time slot is no longer available.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons at bottom of Step 3 */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} type="button">
                      {t('common.back')}
                    </Button>
                    <Button variant="primary" type="submit" loading={submitting} disabled={submitting}>
                      {t('appointments.book')}
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>


        </div>
      </section>
      </div>
    </>
  )
}

export default Appointments
