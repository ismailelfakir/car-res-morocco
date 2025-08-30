import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Card, { CardHeader, CardBody, CardFooter } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { WorkingHoursManager } from '../../components/admin/WorkingHoursManager'
import api, { endpoints } from '../../utils/api'

type WorkingHours = {
  mon: { start: string; end: string }[]
  tue: { start: string; end: string }[]
  wed: { start: string; end: string }[]
  thu: { start: string; end: string }[]
  fri: { start: string; end: string }[]
  sat: { start: string; end: string }[]
  sun: { start: string; end: string }[]
}

interface Magazin {
  _id: string
  name: string
  city: string
  address: string
  geo?: { lat: number; lng: number }
  capacityPerSlot: number
  slotDurationMinutes: number
  workingHours?: WorkingHours
  timezone?: string
  blackoutDays?: string[]
  active: boolean
  services: string[]
}

interface Service {
  _id: string
  name: string

}

const AdminMagazins: React.FC = () => {
  const { t } = useTranslation()

  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMagazin, setEditingMagazin] = useState<Magazin | null>(null)
  const [showForm, setShowForm] = useState(false)
  const isFetchingRef = useRef(false)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    geo: { lat: 0, lng: 0 },
    capacityPerSlot: 2,
    slotDurationMinutes: 20,
    workingHours: {
      mon: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      tue: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      wed: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      thu: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      fri: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      sat: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      sun: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
    } as WorkingHours,
    timezone: 'Africa/Casablanca',
    blackoutDays: [] as string[],
    active: true,
    services: [] as string[]
  })

  useEffect(() => {
    // Prevent duplicate API calls using ref
    if (!isFetchingRef.current) {
      isFetchingRef.current = true
      fetchMagazins()
      fetchServices()
    }
  }, [])

  const fetchMagazins = async () => {
    try {
      setError(null)
      const response = await api.get(endpoints.magazins.admin, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        console.log('Magazins API response:', data) // Debug log
        setMagazins(data.data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch magazins')
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
      setError('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      console.log('Fetching services...')
      const response = await api.get(endpoints.services.list, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        console.log('Services data:', data)
        setServices(data.data || [])
      } else {
        console.error('Failed to fetch services:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.services.length === 0) {
      alert(t('admin.magazins.form.servicesTip'))
      return
    }
    
    console.log('Submitting form data:', formData)
    console.log('Selected services:', formData.services)
    
    try {
      // DEBUG: Log what we're sending
      console.log('Submitting magazin data:', {
        isEditing: !!editingMagazin,
        magazinId: editingMagazin?._id,
        services: formData.services,
        servicesType: typeof formData.services,
        servicesLength: formData.services.length,
        formData: formData
      })
      
      let response
      
      if (editingMagazin) {
        // Update existing magazin
        response = await api.put(endpoints.magazins.update(editingMagazin._id), formData, api.withCredentials())
      } else {
        // Create new magazin
        response = await api.post(endpoints.magazins.create, formData, api.withCredentials())
      }

      if (response.ok) {
        await fetchMagazins()
        resetForm()
        setShowForm(false)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Error: ${errorData.message || t('admin.magazins.form.servicesTip')}`)
      }
    } catch (error) {
      console.error('Error saving magazin:', error)
      alert(t('admin.magazins.form.servicesTip'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.magazins.form.servicesTip'))) return
    
    try {
      const response = await api.delete(endpoints.magazins.delete(id), api.withCredentials())
      
      if (response.ok) {
        await fetchMagazins()
      }
    } catch (error) {
      console.error('Error deleting magazin:', error)
    }
  }

  const handleEdit = (magazin: Magazin) => {
    // DEBUG: Log the magazin data being edited
    console.log('Editing magazin:', {
      magazin,
      services: magazin.services,
      servicesType: typeof magazin.services,
      servicesLength: magazin.services.length,
      firstService: magazin.services[0]
    })
    
    const extractedServices = magazin.services.map((service: any) => 
      typeof service === 'string' ? service : service._id
    )
    
    console.log('Extracted services:', {
      extractedServices,
      extractedType: typeof extractedServices,
      extractedLength: extractedServices.length
    })
    
    setEditingMagazin(magazin)
    setFormData({
      name: magazin.name,
      city: magazin.city,
      address: magazin.address,
      geo: magazin.geo || { lat: 0, lng: 0 },
      capacityPerSlot: magazin.capacityPerSlot,
      slotDurationMinutes: magazin.slotDurationMinutes,
      workingHours: magazin.workingHours || {
        mon: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        tue: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        wed: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        thu: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        fri: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        sat: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        sun: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
      },
      timezone: magazin.timezone || 'Africa/Casablanca',
      blackoutDays: magazin.blackoutDays || [],
      active: magazin.active,
      services: extractedServices
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      address: '',
      geo: { lat: 0, lng: 0 },
      capacityPerSlot: 2,
      slotDurationMinutes: 20,
      workingHours: {
        mon: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        tue: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        wed: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        thu: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        fri: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        sat: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        sun: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
      },
      timezone: 'Africa/Casablanca',
      blackoutDays: [],
      active: true,
      services: []
    })
    setEditingMagazin(null)
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
           <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.magazins.title')}</h1>
           <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.magazins.subtitle')}</p>
           <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
             {t('admin.magazins.availableServices')}: {services.length} | {t('admin.magazins.form.availableServices')}: {formData.services.length}
           </div>
         </div>
         <div className="flex flex-wrap gap-2">
           <Button
             variant="outline"
             onClick={fetchServices}
           >
             {t('admin.magazins.refreshServices')}
           </Button>
           <Button
             onClick={() => {
               resetForm()
               setShowForm(true)
             }}
             variant="primary"
           >
             {t('admin.magazins.addNewCenter')}
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
              {editingMagazin ? t('admin.magazins.editCenter') : t('admin.magazins.addNewCenter')}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('admin.magazins.form.centerName')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                                 <Input
                   label={t('admin.magazins.form.city')}
                   value={formData.city}
                   onChange={(e) => {
                     const city = e.target.value
                     setFormData({ ...formData, city })
                     
                     // Set default coordinates for major Moroccan cities
                     if (city.toLowerCase() === 'casablanca') {
                       setFormData(prev => ({ ...prev, city, geo: { lat: 33.5731, lng: -7.5898 } }))
                     } else if (city.toLowerCase() === 'rabat') {
                       setFormData(prev => ({ ...prev, city, geo: { lat: 34.0209, lng: -6.8416 } }))
                     } else if (city.toLowerCase() === 'marrakech') {
                       setFormData(prev => ({ ...prev, city, geo: { lat: 31.6295, lng: -7.9811 } }))
                     } else if (city.toLowerCase() === 'fes') {
                       setFormData(prev => ({ ...prev, city, geo: { lat: 34.0181, lng: -5.0078 } }))
                     } else if (city.toLowerCase() === 'agadir') {
                       setFormData(prev => ({ ...prev, city, geo: { lat: 30.4278, lng: -9.5981 } }))
                     }
                   }}
                   required
                 />
                <Input
                  label={t('admin.magazins.form.address')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <Input
                  label={t('admin.magazins.form.capacityPerSlot')}
                  type="number"
                  value={formData.capacityPerSlot}
                  onChange={(e) => setFormData({ ...formData, capacityPerSlot: parseInt(e.target.value) })}
                  min="1"
                  required
                />
                                 <Input
                   label={t('admin.magazins.form.slotDuration')}
                   type="number"
                   value={formData.slotDurationMinutes}
                   onChange={(e) => setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value) })}
                   min="15"
                   step="15"
                   required
                 />
                 <Input
                   label={t('admin.magazins.form.latitude')}
                   type="number"
                   step="0.000001"
                   value={formData.geo.lat}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     geo: { ...formData.geo, lat: parseFloat(e.target.value) || 0 }
                   })}
                   required
                 />
                 <Input
                   label={t('admin.magazins.form.longitude')}
                   type="number"
                   step="0.000001"
                   value={formData.geo.lng}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     geo: { ...formData.geo, lng: parseFloat(e.target.value) || 0 }
                   })}
                   required
                 />
                 <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                   💡 {t('admin.magazins.form.coordinatesTip')}
                 </div>
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="active"
                     checked={formData.active}
                     onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                     className="rounded border-gray-300"
                   />
                   <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                     {t('admin.magazins.form.active')}
                   </label>
                 </div>
              </div>
              
              <div className="col-span-2">
                <WorkingHoursManager
                  workingHours={formData.workingHours}
                  onChange={(workingHours) => setFormData({ ...formData, workingHours })}
                />
              </div>

                               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.magazins.form.availableServices')}
                  </label>
                  {services.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      {t('admin.magazins.form.noServicesAvailable')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <label key={service._id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  services: [...formData.services, service._id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  services: formData.services.filter(id => id !== service._id)
                                })
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {service.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    💡 {t('admin.magazins.form.servicesTip')}
                  </div>
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
              {editingMagazin ? t('admin.magazins.actions.updateCenter') : t('admin.magazins.actions.createCenter')}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.magazins.summary')}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{magazins.length}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{t('admin.magazins.totalCenters')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {magazins.filter(m => m.active).length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">{t('admin.magazins.activeCenters')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {magazins.reduce((total, m) => total + m.capacityPerSlot, 0)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">{t('admin.magazins.totalCapacity')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {magazins.reduce((total, m) => total + m.services.length, 0)}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">{t('admin.magazins.totalServices')}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('admin.magazins.technicalCenters')}</h2>
        </CardHeader>
        <CardBody>
          <Table
            columns={[
              { key: 'name', header: t('admin.magazins.form.centerName') },
              { key: 'city', header: t('admin.magazins.form.city') },
              { key: 'address', header: t('admin.magazins.form.address') },
              { key: 'capacityPerSlot', header: t('admin.magazins.form.capacityPerSlot') },
              { key: 'slotDurationMinutes', header: t('admin.magazins.form.slotDuration') },
                              { 
                  key: 'services', 
                  header: t('admin.magazins.form.availableServices'),
                render: (value: any[]) => (
                  <div className="text-sm">
                    {value && value.length > 0 ? (
                      <div className="space-y-1">
                        {value.slice(0, 2).map((service: any) => (
                          <span key={service._id} className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {service.name}
                          </span>
                        ))}
                        {value.length > 2 && (
                          <span className="text-gray-500 dark:text-gray-400 text-xs">+{value.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">{t('admin.magazins.form.availableServices')}</span>
                    )}
                  </div>
                )
              },
              { 
                key: 'active', 
                header: t('admin.magazins.form.active'),
                render: (value: boolean) => (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {value ? t('admin.magazins.form.active') : 'Inactive'}
                  </span>
                )
              },
              { 
                key: 'actions', 
                header: t('common.actions'),
                render: (_value: any, magazin: Magazin) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(magazin)}
                    >
                      {t('admin.magazins.actions.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(magazin._id)}
                    >
                      {t('admin.magazins.actions.delete')}
                    </Button>
                  </div>
                )
              }
            ]}
            data={magazins}
            emptyMessage={t('admin.magazins.noCentersFound')}
          />
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminMagazins
