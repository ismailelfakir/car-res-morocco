import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import SEO from '../components/SEO'
import Input from '../components/ui/Input'
import api, { endpoints } from '../utils/api'

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
  services: string[]
  active: boolean
  geo?: {
    lat: number
    lng: number
  }
}

const Magazins: React.FC = () => {
  const { t } = useTranslation()
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [filteredMagazins, setFilteredMagazins] = useState<Magazin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    fetchMagazins()
  }, [])

  useEffect(() => {
    filterMagazins()
  }, [selectedCity, searchTerm, magazins])

  const fetchMagazins = async () => {
    try {
      setLoading(true)
      const response = await api.get(endpoints.magazins.list)
      if (response.ok) {
        const data = await response.json()
        setMagazins(data.data || [])
        
        // Extract unique cities
        const uniqueCities = [...new Set((data.data || []).map((m: Magazin) => m.city))] as string[]
        setCities(uniqueCities)
      } else {
        console.error('Failed to fetch magazins')
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMagazins = () => {
    let filtered = magazins

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(m => m.city === selectedCity)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMagazins(filtered)
  }

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...cities.map(city => ({ value: city, label: city }))
  ]

  const getDistanceFromCasablanca = (lat: number, lng: number) => {
    // Casablanca coordinates
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading technical centers...</p>
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('locations.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-95 leading-relaxed">
            Find a technical center near you for your car inspection needs
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Find Your Nearest Center
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Search and filter technical centers by location and services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <Input
                label="Search Centers"
                placeholder="Search by name, city, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="filled"
                size="md"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div>
              <Select
                label="Filter by City"
                options={cityOptions}
                value={selectedCity}
                onChange={setSelectedCity}
                variant="filled"
                size="md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
              <span className="font-semibold">{filteredMagazins.length}</span> center{filteredMagazins.length !== 1 ? 's' : ''} found
              {selectedCity && ` in ${selectedCity}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCity('')
                  setSearchTerm('')
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Magazins Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMagazins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMagazins.map((magazin) => (
                <Card 
                  key={magazin._id} 
                  className="group hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {magazin.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        magazin.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {magazin.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{magazin.city}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {magazin.address}
                    </p>
                  </CardHeader>
                  
                  <CardBody className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Available Services:</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                          {magazin.services.length} service{magazin.services.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {magazin.geo && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{getDistanceFromCasablanca(magazin.geo.lat, magazin.geo.lng)} km from Casablanca</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                  
                  <CardFooter className="pt-4 flex space-x-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/magazins/${magazin._id}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="primary" className="flex-1" asChild>
                      <Link to={`/book?magazinId=${magazin._id}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                No centers found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {selectedCity 
                  ? `We couldn't find any technical centers in ${selectedCity}. Try adjusting your search criteria.`
                  : searchTerm 
                    ? `No centers match "${searchTerm}". Try a different search term.`
                    : 'No technical centers are currently available. Please check back later.'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCity('')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Our Coverage Area
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We have technical centers strategically located across Morocco to serve you better
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">
              <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V5a2 2 0 011.106-1.79l6-3a2 2 0 011.788 0l6 3A2 2 0 0118 5v10.382a2 2 0 01-1.553 1.894L11 20z"/></svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Interactive Map Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're working on an interactive map to help you find the nearest technical center
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {cities.slice(0, 6).map((city, index) => (
                <span key={index} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {city}
                </span>
              ))}
              {cities.length > 6 && (
                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                  +{cities.length - 6} more
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Book Your Inspection?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Find a center near you and schedule your appointment today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointments">
              <Button variant="inverted" size="md">
                Book Appointment
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outlineOnDark" size="md">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default Magazins
