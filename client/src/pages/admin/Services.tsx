import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Card, { CardHeader, CardBody, CardFooter } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import api, { endpoints } from '../../utils/api'

interface Service {
  _id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

const AdminServices: React.FC = () => {
  const { t } = useTranslation()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const isFetchingRef = useRef(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    // Prevent duplicate API calls using ref
    if (!isFetchingRef.current) {
      isFetchingRef.current = true
      fetchServices()
    }
  }, [])

  const fetchServices = async () => {
    try {
      setError(null)
      const response = await api.get(endpoints.services.list, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.message || t('admin.services.form.descriptionPlaceholder'))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError(t('admin.services.form.descriptionPlaceholder'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      if (editingService) {
        const response = await api.put(endpoints.services.update(editingService._id), formData, api.withCredentials())
        if (response.ok) {
          await fetchServices()
          resetForm()
          setShowForm(false)
        } else {
          const errorData = await response.json()
          setError(errorData.message || t('admin.services.form.descriptionPlaceholder'))
        }
      } else {
        const response = await api.post(endpoints.services.create, formData, api.withCredentials())
        if (response.ok) {
          await fetchServices()
          resetForm()
          setShowForm(false)
        } else {
          const errorData = await response.json()
          setError(errorData.message || t('admin.services.form.descriptionPlaceholder'))
        }
      }
    } catch (error) {
      console.error('Error saving service:', error)
      setError(t('admin.services.form.descriptionPlaceholder'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.services.form.descriptionPlaceholder'))) return
    
    try {
      const response = await api.delete(endpoints.services.delete(id), api.withCredentials())
      
      if (response.ok) {
        await fetchServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      
      description: service.description || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      
      description: ''
    })
    setEditingService(null)
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.services.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.services.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={fetchServices}
            variant="outline"
          >
            {t('admin.services.refresh')}
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            variant="primary"
          >
            {t('admin.services.addNewService')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">{t('common.error')}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {editingService ? t('admin.services.editService') : t('admin.services.addNewService')}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('admin.services.form.serviceName')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

              </div>
              
              <div>
                <Input
                  label={t('admin.services.form.description')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('admin.services.form.descriptionPlaceholder')}
                />
              </div>
            </form>
          </CardBody>
          <CardFooter className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              {editingService ? t('admin.services.actions.updateService') : t('admin.services.actions.createService')}
            </Button>
          </CardFooter>
        </Card>
      )}



      {/* Summary Stats */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.services.summary')}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{services.length}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{t('admin.services.totalServices')}</div>
            </div>

          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('admin.services.availableServices')}</h2>
        </CardHeader>
        <CardBody>
          <Table
            columns={[
              { key: 'name', header: t('admin.services.form.serviceName') },

              { 
                key: 'description', 
                header: t('admin.services.form.description'),
                render: (value: string) => (
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {value || t('admin.services.form.descriptionPlaceholder')}
                  </div>
                )
              },
              { 
                key: 'createdAt', 
                header: t('common.created'),
                render: (value: string) => (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {value ? new Date(value).toLocaleDateString() : 'N/A'}
                  </div>
                )
              },
              { 
                key: 'actions', 
                header: t('common.actions'),
                render: (_value: any, service: Service) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(service._id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                )
              }
            ]}
            data={services}
            emptyMessage={t('admin.services.noServicesFound')}
          />
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminServices
