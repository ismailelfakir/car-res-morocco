import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import SEO from '../components/SEO'
import api, { endpoints } from '../utils/api'

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
  workingHours: {
    [key: string]: Array<{ start: string; end: string }>
  }
  timezone: string
  active: boolean
  geo?: {
    lat: number
    lng: number
  }
  services: string[]
}

const Locations: React.FC = () => {
  const { t } = useTranslation()
  const [selectedCity, setSelectedCity] = useState('all')
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMagazins()
  }, [])

  const fetchMagazins = async () => {
    try {
      setLoading(true)
      const response = await api.get(endpoints.magazins.list)
      if (response.ok) {
        const data = await response.json()
        setMagazins(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
    } finally {
      setLoading(false)
    }
  }

  const cities = [
    { value: 'all', label: t('locations.allCities') },
    ...Array.from(new Set(magazins.map(m => m.city))).map(city => ({ value: city, label: city }))
  ]

  const filteredMagazins = selectedCity === 'all' 
    ? magazins.filter(m => m.active)
    : magazins.filter(location => location.city === selectedCity && location.active)

  const getDistanceFromCasablanca = (lat: number, lng: number) => {
    const casablancaLat = 33.5731
    const casablancaLng = -7.5898
    
    const R = 6371 // Earth's radius in km
    const dLat = (lat - casablancaLat) * Math.PI / 180
    const dLng = (lng - casablancaLng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(casablancaLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }

  const formatWorkingHours = (hours: Array<{ start: string; end: string }>) => {
    return hours.map(h => `${h.start} - ${h.end}`).join(', ')
  }

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t('common.loading')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('locations.loadingCenters')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={t('seo.locations.title')}
        description={t('seo.locations.description')}
        keywords={t('seo.locations.keywords')}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "CarTech Morocco Technical Centers",
          "description": t('seo.locations.description'),
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "MA",
            "addressRegion": "Morocco"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Morocco"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Car Inspection Services"
          }
        }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {t('locations.title')}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto opacity-95 leading-relaxed px-4">
            {t('locations.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm text-white border border-white/20">
              🔒 {t('common.secure')}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm text-white border border-white/20">
              ⚡ {t('common.fast')}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm text-white border border-white/20">
              🌍 {t('common.nationwide')}
            </span>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              {t('locations.findNearestCenter')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              {t('locations.findNearestCenterDesc')}
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <Select
                label=""
                options={cities}
                value={selectedCity}
                onChange={setSelectedCity}
                className="max-w-xs"
                variant="filled"
                size="md"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMagazins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredMagazins.map((location) => (
                <Card 
                  key={location._id} 
                  className={`group hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in-up`}

                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {location.name}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{location.city}</p>
                      </div>
                                              <div className="text-right">
                          {location.geo && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('locations.distanceFromCasablanca', { distance: getDistanceFromCasablanca(location.geo.lat, location.geo.lng) })}
                            </div>
                          )}
                        </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{location.address}</span>
                    </div>
                  </CardHeader>
                  
                  <CardBody className="pt-0">
                    <div className="space-y-4">
                      {/* Working Hours */}
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{t('locations.workingHours')}</span>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                            {Object.entries(location.workingHours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between items-center">
                                <span className="font-medium capitalize">{getDayName(day)}:</span>
                                <span className="text-right">
                                  {hours.length > 0 ? formatWorkingHours(hours) : t('locations.closed')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{t('locations.availableServices')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {location.services.length === 1 
                              ? t('locations.servicesCount', { count: location.services.length })
                              : t('locations.servicesCountPlural', { count: location.services.length })
                            }
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{location.city}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm">{location.address}</span>
                        </div>
                      </div>

                      {/* Timezone Info */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{t('locations.timezone')}</span>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{location.timezone}</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  
                  <CardFooter className="pt-4 flex space-x-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/magazins/${location._id}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('locations.viewDetails')}
                      </Link>
                    </Button>
                    <Button variant="primary" className="flex-1" asChild>
                      <Link to={`/book?magazinId=${location._id}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('locations.bookNow')}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
                {t('locations.noCentersFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">
                {selectedCity !== 'all' 
                  ? t('locations.noCentersInCity', { city: selectedCity })
                  : t('locations.noCentersAvailable')
                }
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCity('all')}
              >
                {t('locations.viewAllCenters')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
              {t('locations.coverageArea')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              {t('locations.coverageAreaDesc')}
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 md:p-8 text-center">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">
              <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V5a2 2 0 011.106-1.79l6-3a2 2 0 011.788 0l6 3A2 2 0 0118 5v10.382a2 2 0 01-1.553 1.894L11 20z"/></svg>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              {t('locations.interactiveMap')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              {t('locations.interactiveMapDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from(new Set(magazins.map(m => m.city))).slice(0, 6).map((city, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{city.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{city}</span>
                </div>
              ))}
              {Array.from(new Set(magazins.map(m => m.city))).length > 6 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('locations.moreCities')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            {t('locations.readyToVisit')}
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-95 px-4">
            {t('locations.readyToVisitDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointments">
              <Button variant="inverted" size="md">
                {t('locations.bookAppointment')}
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outlineOnDark" size="md">
                {t('locations.viewServices')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default Locations
