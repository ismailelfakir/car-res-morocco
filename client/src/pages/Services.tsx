import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import SEO from '../components/SEO'
import { WrenchIcon, ArrowPathIcon, SparklesIcon, CheckCircleIcon, ShieldCheckIcon, BeakerIcon, DocumentCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api, { endpoints } from '../utils/api'

interface Service {
  _id: string
  name: string
  description?: string
}

const Services: React.FC = () => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await api.get(endpoints.services.list)
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'inspection', label: 'Inspections' },
    { value: 'emissions', label: 'Emissions' },
    { value: 'specialized', label: 'Specialized' }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => {
        if (selectedCategory === 'inspection') return service.name.toLowerCase().includes('inspection')
        if (selectedCategory === 'emissions') return service.name.toLowerCase().includes('emission')
        return true
      })

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('periodic')) return <WrenchIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400" />
    if (name.includes('reinspection')) return <ArrowPathIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400" />
    if (name.includes('emission')) return <SparklesIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400" />
    return <CheckCircleIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400" />
  }

  const getServiceFeatures = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('periodic')) {
      return t('services.features.periodic', { returnObjects: true }) as string[]
    }
    if (name.includes('reinspection')) {
      return t('services.features.reinspection', { returnObjects: true }) as string[]
    }
    if (name.includes('emission')) {
      return t('services.features.emissions', { returnObjects: true }) as string[]
    }
    return t('services.features.default', { returnObjects: true }) as string[]
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
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('common.loadingServices')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={t('seo.services.title')}
        description={t('seo.services.description')}
        keywords={t('seo.services.keywords')}
        type="service"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Car Technical Inspection Services",
          "description": t('seo.services.description'),
          "provider": {
            "@type": "Organization",
            "name": "CarTech Morocco",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "MA",
              "addressRegion": "Morocco"
            }
          },
          "areaServed": {
            "@type": "Country",
            "name": "Morocco"
          },
          "serviceType": "Vehicle Inspection"
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {t('services.title')}
          </h1>
                      <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto opacity-95 leading-relaxed px-4">
              {t('services.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/></svg>
                {t('common.secure')}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                {t('common.fast')}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {t('common.certified')}
              </span>
            </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              {t('services.chooseService')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              {t('services.chooseServiceDesc')}
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <Select
                label=""
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="max-w-xs"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredServices.map((service) => (
                <Card 
                  key={service._id} 
                  className={`group hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in-up`}

                >
                  <CardHeader className="text-center pt-6 md:pt-8">
                    <div className="relative">
                      <div className="text-4xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                        {getServiceIcon(service.name)}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
                      {service.description || t('services.periodicDesc')}
                    </p>

                  </CardHeader>
                  
                  <CardBody className="px-4 md:px-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm md:text-base">{t('services.whatsIncluded')}</h4>
                      {getServiceFeatures(service.name).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 dark:text-green-400 mr-2 md:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                  
                  <CardFooter className="pt-4 md:pt-6">
                    <Link to={`/book?serviceId=${service._id}`} className="w-full">
                      <Button 
                        variant="primary"
                        className="w-full group-hover:scale-105 transition-transform duration-300"
                        size="lg"
                      >
                        {t('services.bookNow')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
                {t('services.noServicesFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">
                {selectedCategory !== 'all' 
                  ? t('services.noServicesCategory', { category: selectedCategory })
                  : t('services.noServicesAvailable')
                }
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory('all')}
              >
                {t('services.viewAllServices')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
              {t('services.whyChooseUs')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              {t('services.whyChooseUsDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                Icon: ShieldCheckIcon,
                title: t('services.certifiedTechnicians'),
                description: t('services.certifiedTechniciansDesc')
              },
              {
                Icon: BeakerIcon,
                title: t('services.advancedEquipment'),
                description: t('services.advancedEquipmentDesc')
              },
              {
                Icon: DocumentCheckIcon,
                title: t('services.digitalCertificates'),
                description: t('services.digitalCertificatesDesc')
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <item.Icon className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            {t('services.readyToBook')}
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-95 px-4">
            {t('services.readyToBookDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointments">
              <Button variant="inverted" size="lg">
                {t('services.bookAppointment')}
              </Button>
            </Link>
            <Link to="/magazins">
              <Button variant="outlineOnDark" size="lg">
                {t('services.findLocations')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default Services
