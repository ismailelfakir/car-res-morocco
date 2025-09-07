import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import api, { endpoints } from '../../utils/api'

interface Appointment {
  _id: string
  reference: string
  customer: {
    name: string
    phone: string
    carPlate: string
    notes?: string
  }
  magazinId: {
    _id: string
    name: string
    city: string
  }
  serviceId: {
    name: string
  
  }
  start: string
  end: string
  status: 'pending' | 'confirmed' | 'canceled'
  createdAt: string
}

interface Magazin {
  _id: string
  name: string
  city: string
}

const AdminAppointments: React.FC = () => {
  const { t } = useTranslation()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const isFetchingRef = useRef(false)
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    magazinId: ''
  })

  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    if (filters.status && appointment.status !== filters.status) return false
    if (filters.date) {
      const appointmentDate = new Date(appointment.start).toISOString().split('T')[0]
      if (appointmentDate !== filters.date) return false
    }
    if (filters.magazinId && appointment.magazinId._id !== filters.magazinId) return false
    return true
  })

  useEffect(() => {
    // Prevent duplicate API calls using ref
    if (!isFetchingRef.current) {
      isFetchingRef.current = true
      fetchAppointments(1)
      fetchMagazins()
    }
  }, [])

  // Handle filter changes with debouncing
  useEffect(() => {
    setApplyingFilters(true)
    const timer = setTimeout(() => {
      setApplyingFilters(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [filters])

  const fetchAppointments = async (targetPage = page) => {
    try {
      setError(null)
      const params = new URLSearchParams()
      params.append('page', String(targetPage))
      params.append('limit', String(limit))
      if (filters.status) params.append('status', filters.status)
      if (filters.date) params.append('date', filters.date)
      if (filters.magazinId) params.append('magazinId', filters.magazinId)

      const response = await api.get(`${endpoints.appointments.admin}?${params.toString()}`, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
        setPage(data.page || targetPage)
        setTotalPages(data.totalPages || 1)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMagazins = async () => {
    try {
      const response = await api.get(endpoints.magazins.list, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setMagazins(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'canceled') => {
    try {
      const endpoint = newStatus === 'confirmed' ? 'confirm' : 'cancel'
      const response = await api.post(endpoints.appointments[endpoint](appointmentId), {}, api.withCredentials())
      
      if (response.ok) {
        await fetchAppointments()
      }
    } catch (error) {
      console.error(`Error ${newStatus}ing appointment:`, error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.appointments.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.appointments.subtitle')}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchAppointments(1)}
            disabled={loading}
          >
            {loading ? t('admin.appointments.refreshing') : t('admin.appointments.refreshData')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">{t('admin.appointments.error')}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
            >
              {t('admin.appointments.dismiss')}
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(filters.status || filters.date || filters.magazinId) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-blue-800 dark:text-blue-300 font-medium">{t('admin.appointments.activeFilters')}</p>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {filters.status && <span className="mr-3">Status: {filters.status}</span>}
                {filters.date && <span className="mr-3">Date: {filters.date}</span>}
                {filters.magazinId && (
                  <span className="mr-3">
                    Center: {magazins.find(m => m._id === filters.magazinId)?.name || filters.magazinId}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ status: '', date: '', magazinId: '' })}
            >
              {t('admin.appointments.clearAll')}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.appointments.filters')}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={t('admin.appointments.status')}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: '', label: t('admin.appointments.allStatuses') },
                { value: 'pending', label: t('appointments.status.pending') },
                { value: 'confirmed', label: t('appointments.status.confirmed') },
                { value: 'canceled', label: t('appointments.status.cancelled') }
              ]}
            />
            
            <Input
              label={t('admin.appointments.date')}
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
            
            <Select
              label={t('admin.appointments.technicalCenter')}
              value={filters.magazinId}
              onChange={(value) => setFilters({ ...filters, magazinId: value })}
              options={[
                { value: '', label: t('admin.appointments.allCenters') },
                ...magazins.map((magazin) => ({
                  value: magazin._id,
                  label: `${magazin.name} - ${magazin.city}`
                }))
              ]}
            />
            
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', date: '', magazinId: '' })}
              className="self-end"
            >
              {t('admin.appointments.clearFilters')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('admin.appointments.appointments')}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAppointments.length} {filteredAppointments.length !== 1 ? t('admin.appointments.appointments') : t('admin.appointments.appointment')}
              {filters.status || filters.date || filters.magazinId ? ` (${t('admin.appointments.filteredFrom')} ${appointments.length} ${t('admin.appointments.total')})` : ''}
              {applyingFilters && ` • ${t('admin.appointments.applyingFilters')}`}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            columns={[
              { 
                key: 'reference', 
                header: t('admin.appointments.reference'),
                render: (value: string) => (
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {value}
                  </span>
                )
              },
              { 
                key: 'customer', 
                header: t('admin.appointments.customer'),
                render: (value: any) => (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{value.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{value.phone}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{value.carPlate}</div>
                  </div>
                )
              },
              { 
                key: 'serviceId', 
                header: t('admin.appointments.service'),
                render: (value: any) => (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{value.name}</div>

                  </div>
                )
              },
              { 
                key: 'magazinId', 
                header: t('admin.appointments.location'),
                render: (value: any) => (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{value.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{value.city}</div>
                  </div>
                )
              },
              { 
                key: 'start', 
                header: t('admin.appointments.dateTime'),
                render: (value: string, appointment: Appointment) => (
                                      <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-100">{formatDate(value)}</div>
                      <div className="text-gray-500 dark:text-gray-400">{t('admin.appointments.to')} {formatDate(appointment.end)}</div>
                    </div>
                )
              },
              { 
                key: 'status', 
                header: t('admin.appointments.status'),
                render: (value: string) => getStatusBadge(value)
              },
              { 
                key: 'actions', 
                header: t('common.actions'),
                render: (_value: any, appointment: Appointment) => (
                  <div className="flex flex-wrap gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                        >
                          {t('admin.appointments.actions.confirm')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(appointment._id, 'canceled')}
                        >
                          {t('admin.appointments.actions.cancel')}
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(appointment._id, 'canceled')}
                      >
                        {t('admin.appointments.actions.cancel')}
                      </Button>
                    )}
                    {appointment.status === 'canceled' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                      >
                        {t('admin.appointments.actions.reactivate')}
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
            data={filteredAppointments}
            emptyMessage={t('admin.appointments.noAppointmentsFound')}
          />

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchAppointments(page - 1)}
              >
                {t('common.previous')}
              </Button>
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => fetchAppointments(page + 1)}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminAppointments
