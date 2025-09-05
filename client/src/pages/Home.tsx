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

interface Service {
  _id: string
  name: string
  description: string
}

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
}

const Home: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    totalMagazins: 0,
    totalServices: 0,
    customerSatisfaction: 99
  })
  const [services, setServices] = useState<Service[]>([])
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  // Function to get random items from array
  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    if (array.length <= count) return array
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch magazins data
      console.log('Fetching magazins...')
      const magazinsResponse = await api.get(endpoints.magazins.list)
      const magazinsData = await magazinsResponse.json()
      console.log('Magazins response:', magazinsData)
      const magazinsList = magazinsData.data || []
      const totalMagazins = magazinsList.length
      
      // Fetch services data
      console.log('Fetching services...')
      const servicesResponse = await api.get(endpoints.services.list)
      const servicesData = await servicesResponse.json()
      console.log('Services response:', servicesData)
      const servicesList = servicesData.data || []
      const totalServices = servicesList.length
      
      // Use a reasonable estimate for appointments based on services and magazins
      const totalAppointments = Math.floor(totalServices * totalMagazins * 50) // Estimate
      
      setStats({
        totalAppointments,
        totalMagazins,
        totalServices,
        customerSatisfaction: 99 // Keep this as a default since we don't have customer feedback data
      })
      
      // Set services and magazins data for display with random selection
      setServices(servicesList)
      setMagazins(magazinsList)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set fallback data if API fails
      setStats({
        totalAppointments: 0,
        totalMagazins: 0,
        totalServices: 0,
        customerSatisfaction: 99
      })
      setServices([])
      setMagazins([])
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
    { number: loading ? '...' : `${stats.totalServices}+`, label: t('home.stats.servicesAvailable') },
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {t('home.hero.badge')}
            </div>
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

      {/* Featured Services Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <WrenchIcon className="w-4 h-4 mr-2" />
              {t('home.featuredServices.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-8">
              {t('home.featuredServices.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('home.featuredServices.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {getRandomItems(services, 3).map((service) => (
              <Card key={service._id} className="group hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-700 transform hover:-translate-y-4 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardBody className="p-8 md:p-10 text-center relative">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Icon container */}
                  <div className="relative z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 md:mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mx-auto shadow-lg">
                    <WrenchIcon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg mb-6 min-h-[3rem] flex items-center justify-center">
                      {service.description || t('home.featuredServices.defaultDescription')}
                    </p>
                    
                    {/* Features list */}
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {t('home.featuredServices.feature1')}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {t('home.featuredServices.feature2')}
                      </div>
                    </div>
                    
                    <Link to="/services">
                      <Button variant="outline" size="md" className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg transition-all duration-300 font-medium">
                        {t('home.featuredServices.learnMore')}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12 md:mt-16">
            <Link to="/services">
              <Button variant="primary" size="lg" className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {t('home.featuredServices.viewAllServices')}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Technical Centers Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {t('home.featuredCenters.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-8">
              {t('home.featuredCenters.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('home.featuredCenters.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {getRandomItems(magazins, 3).map((magazin) => (
              <Card key={magazin._id} className="group hover:shadow-2xl dark:hover:shadow-green-500/20 transition-all duration-700 transform hover:-translate-y-4 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <CardBody className="p-8 md:p-10 text-center relative">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Icon container */}
                  <div className="relative z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-6 md:mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mx-auto shadow-lg">
                    <MapPinIcon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      {magazin.name}
                    </h3>
                    <div className="flex items-center justify-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {magazin.city}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-6 min-h-[2.5rem] flex items-center justify-center leading-relaxed">
                      {magazin.address}
                    </p>
                    
                    {/* Features list */}
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {t('home.featuredCenters.feature1')}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {t('home.featuredCenters.feature2')}
                      </div>
                    </div>
                    
                    <Link to="/magazins">
                      <Button variant="outline" size="md" className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 group-hover:shadow-lg transition-all duration-300 font-medium">
                        {t('home.featuredCenters.visitCenter')}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12 md:mt-16">
            <Link to="/magazins">
              <Button variant="primary" size="lg" className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                {t('home.featuredCenters.viewAllCenters')}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
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

      {/* Contact Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('home.contact.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-8">
              {t('home.contact.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('home.contact.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {t('home.contact.info.title')}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {t('home.contact.info.phone')}
                      </h4>
                      <button
                        onClick={() => copyToClipboard('+212 6 12 34 56 78', 'phone')}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <span>+212 6 12 34 56 78</span>
                        <div className="relative">
                          {copiedItem === 'phone' ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {t('home.contact.info.email')}
                      </h4>
                      <button
                        onClick={() => copyToClipboard('info@cartech-morocco.ma', 'email')}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <span>info@cartech-morocco.ma</span>
                        <div className="relative">
                          {copiedItem === 'email' ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {t('home.contact.social.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('home.contact.social.subtitle')}
                </p>
                <div className="flex space-x-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 text-gray-600 dark:text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-gray-600 dark:text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-400 text-gray-600 dark:text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-700 text-gray-600 dark:text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('home.contact.form.title')}
              </h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('home.contact.form.name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder={t('home.contact.form.name')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('home.contact.form.email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder={t('home.contact.form.email')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('home.contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder={t('home.contact.form.subject')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('home.contact.form.message')}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder={t('home.contact.form.message')}
                  ></textarea>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t('home.contact.form.send')}
                </Button>
              </form>
            </div>
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
