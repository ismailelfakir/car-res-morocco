import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SEO from '../components/SEO'

const CheckAppointment: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ref = reference.trim().toUpperCase()
    if (!ref || !/^[A-Z0-9]{6}$/.test(ref)) {
      setError(t('check.invalidRef'))
      return
    }
    navigate(`/booking/${ref}`)
  }

  return (
    <>
      <SEO
        title={t('seo.check.title')}
        description={t('seo.check.description')}
        keywords={t('seo.check.keywords')}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Car Inspection Status Checker",
          "description": t('seo.check.description'),
          "applicationCategory": "AutomotiveService"
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('check.title')}</h1>
          <p className="text-lg opacity-95">{t('check.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('check.findBooking')}</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('check.referenceCode')}
                placeholder={t('check.placeholder')}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                error={error}
                variant="filled"
                                  size="md"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <div className="flex justify-end">
                <Button variant="primary" type="submit">
                  {t('check.cta')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
      </div>
    </>
  )
}

export default CheckAppointment


