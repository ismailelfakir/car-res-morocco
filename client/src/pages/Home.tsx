import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card, { CardBody } from '../components/ui/Card'
import SEO from '../components/SEO'
import {
  WrenchIcon,
  CheckCircleIcon,
  MapPinIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import api, { endpoints } from '../utils/api'

interface Stats {
  totalAppointments: number
  totalMagazins: number
  totalServices: number
  customerSatisfaction: number
}

const Home: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    totalMagazins: 0,
    totalServices: 0,
    customerSatisfaction: 99
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments count
      const appointmentsResponse = await api.get(endpoints.appointments.create)
      const appointmentsData = await appointmentsResponse.json()
      const totalAppointments = appointmentsData.data?.length || 0
      
      // Fetch magazins count
      const magazinsResponse = await api.get(endpoints.magazins.list)
      const magazinsData = await magazinsResponse.json()
      const totalMagazins = magazinsData.data?.length || 0
      
      // Fetch services count
      const servicesResponse = await api.get(endpoints.services.list)
      const servicesData = await servicesResponse.json()
      const totalServices = servicesData.data?.length || 0
      
      setStats({
        totalAppointments,
        totalMagazins,
        totalServices,
        customerSatisfaction: 99 // Keep this as a default since we don't have customer feedback data
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <WrenchIcon className="w-8 h-8 md:w-10 md:h-10" />,
      title: t('home.features.online'),
      description: t('home.features.onlineDesc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8 md:w-10 md:h-10" />,
      title: t('home.features.certified'),
      description: t('home.features.certifiedDesc'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <MapPinIcon className="w-8 h-8 md:w-10 md:h-10" />,
      title: t('home.features.convenient'),
      description: t('home.features.convenientDesc'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BoltIcon className="w-8 h-8 md:w-10 md:h-10" />,
      title: t('home.features.fast'),
      description: t('home.features.fastDesc'),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const displayStats = [
    { number: loading ? '...' : `${stats.totalAppointments.toLocaleString()}+`, label: t('home.stats.vehiclesInspected') },
    { number: loading ? '...' : `${stats.totalMagazins}+`, label: t('home.stats.technicalCenters') },
    { number: `${stats.customerSatisfaction}%`, label: t('home.stats.customerSatisfaction') },
    { number: '24/7', label: t('home.stats.onlineBooking') }
  ]

  return (
    <>
      <SEO 
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.home.keywords')}
      />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-4xl mx-auto opacity-95 leading-relaxed px-4">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                <svg className="w-3 h-3 mr-1 text-blue-700 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/></svg>
                {t('common.secure')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                <BoltIcon className="w-3 h-3 mr-1" />
                {t('common.fast')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {t('common.nationwide')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/appointments">
                <Button variant="inverted" size="md" className="text-sm md:text-base px-6 md:px-8 py-2.5 md:py-3 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                  {t('home.hero.cta')}
                </Button>
              </Link>
              <Link to="/magazins">
                <Button variant="outlineOnDark" size="md" className="text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 transition-all duration-300">
                  {t('navigation.locations')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 md:h-3 bg-white rounded-full mt-1 md:mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardBody className="text-center p-6 md:p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r ${feature.color} text-white mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: t('home.howItWorks.step1.title'),
                description: t('home.howItWorks.step1.description'),
                icon: <ClipboardDocumentListIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
              },
              {
                step: '02',
                title: t('home.howItWorks.step2.title'),
                description: t('home.howItWorks.step2.description'),
                icon: <CalendarDaysIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
              },
              {
                step: '03',
                title: t('home.howItWorks.step3.title'),
                description: t('home.howItWorks.step3.description'),
                icon: <CheckCircleIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-gray-300 dark:from-blue-400 dark:to-gray-600 transform -translate-y-1/2 z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-lg md:text-xl mb-4 md:mb-6">
                    {item.step}
                  </div>
                  <div className="mb-3 md:mb-4 flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-95 max-w-2xl mx-auto px-4">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/appointments">
                              <Button variant="inverted" size="md" className="text-sm md:text-base px-6 md:px-8 py-2.5 md:py-3 shadow-lg hover:shadow-white/25 transition-all duration-300 transform hover:scale-105">
                  {t('home.cta.bookAppointment')}
                </Button>
              </Link>
              <Link to="/magazins">
                <Button variant="outlineOnDark" size="md" className="text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 transition-all duration-300">
                  {t('home.cta.findLocations')}
                </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default Home
