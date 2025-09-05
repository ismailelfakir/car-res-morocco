import React, { useState, useEffect } from 'react'
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
  status: string
  createdAt: string
}

interface Magazin {
  _id: string
  name: string
  city: string
}

interface DailyReport {
  magazinId: string
  magazinName: string
  magazinCity: string
  appointments: Appointment[]
  totalAppointments: number
  confirmedAppointments: number
  pendingAppointments: number
  canceledAppointments: number
}

const AdminReports: React.FC = () => {
  const { t } = useTranslation()

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [selectedMagazin, setSelectedMagazin] = useState('')
  const [magazins, setMagazins] = useState<Magazin[]>([])
  const [dailyReport, setDailyReport] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchMagazins()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchDailyReport()
    }
  }, [selectedDate])

  const fetchMagazins = async () => {
    try {
      const response = await api.get(endpoints.magazins.admin, api.withCredentials())
      if (response.ok) {
        const data = await response.json()
        setMagazins(data.data || [])
      } else {
        console.error('Failed to fetch magazins:', response.status)
      }
    } catch (error) {
      console.error('Error fetching magazins:', error)
    }
  }

  const fetchDailyReport = async () => {
    setLoading(true)
    try {
      console.log('Fetching daily report for date:', selectedDate)
      const response = await api.get(endpoints.reports.daily(selectedDate), api.withCredentials())
      
      if (response.ok) {
        const data = await response.json()
        console.log('Daily report response:', data)
        
        // Transform the data to match our interface
        const transformedData = data.data?.magazins?.map((report: any) => ({
          magazinId: report.magazin.id,
          magazinName: report.magazin.name,
          magazinCity: report.magazin.city,
          appointments: report.appointments || [],
          totalAppointments: report.totalAppointments || 0,
          confirmedAppointments: report.totalAppointments || 0, // Backend only returns confirmed
          pendingAppointments: 0, // Backend only returns confirmed
          canceledAppointments: 0 // Backend only returns confirmed
        })) || []
        
        console.log('Transformed daily report data:', transformedData)
        setDailyReport(transformedData)
        setError(null)
        setSuccess(null)
      } else {
        console.error('Failed to fetch daily report:', response.status)
        const errorData = await response.json()
        console.error('Daily report error:', errorData)
        
        if (response.status === 401) {
          setError('Authentication required. Please log in as admin.')
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
        } else {
          setError(errorData.message || 'Failed to fetch daily report')
        }
      }
    } catch (error) {
      console.error('Error fetching daily report:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (magazinId: string, magazinName: string) => {
    try {
      setDownloadingPDF(magazinId)
      console.log(`Downloading PDF for magazin ${magazinId} on date ${selectedDate}`)
      
      const response = await api.get(endpoints.reports.dailyByMagazin(magazinId, selectedDate), api.withCredentials())
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `appointments-${selectedDate}-${magazinName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        console.log('PDF download completed successfully')
        setSuccess(`PDF for ${magazinName} downloaded successfully!`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        console.error('Failed to download PDF:', response.status)
        const errorData = await response.text()
        console.error('PDF download error:', errorData)
        
        if (response.status === 401) {
          setError('Authentication required for PDF download')
        } else if (response.status === 403) {
          setError('Access denied for PDF download')
        } else if (response.status === 404) {
          setError('PDF report not found for this date/center')
        } else {
          setError('Failed to download PDF report')
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setDownloadingPDF(null)
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

  const getTotalStats = () => {
    return dailyReport.reduce((acc, report) => ({
      total: acc.total + report.totalAppointments,
      confirmed: acc.confirmed + report.confirmedAppointments,
      pending: acc.pending + report.pendingAppointments,
      canceled: acc.canceled + report.canceledAppointments
    }), { total: 0, confirmed: 0, pending: 0, canceled: 0 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalStats = getTotalStats()

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('admin.reports.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.reports.subtitle')}</p>
        </div>
        <Button
          onClick={fetchDailyReport}
          variant="outline"
          loading={loading}
        >
          {t('admin.reports.refreshReports')}
        </Button>
      </div>

      {/* Success Display */}
      {success && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardBody>
            <div className="flex items-center text-green-800">
              <span className="text-xl mr-2">✅</span>
              <span>{success}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center text-red-800">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.reports.reportControls')}</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-4">
            <Input
              label={t('admin.reports.selectDate')}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            
            <Select
              label={t('admin.reports.filterByCenter')}
              value={selectedMagazin}
              onChange={(value) => setSelectedMagazin(value)}
              options={[
                { value: '', label: t('admin.reports.allCenters') },
                ...magazins.map((magazin) => ({
                  value: magazin._id,
                  label: `${magazin.name} - ${magazin.city}`
                }))
              ]}
            />


          </div>
        </CardBody>
      </Card>

      {/* Summary Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('admin.reports.summary')} {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalStats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin.reports.totalAppointments')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalStats.confirmed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin.reports.confirmed')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalStats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin.reports.pending')}</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalStats.canceled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin.reports.canceled')}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Per-Magazin Reports */}
      {dailyReport
        .filter(report => !selectedMagazin || report.magazinId === selectedMagazin)
        .map((report) => (
          <Card key={report.magazinId} className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{report.magazinName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{report.magazinCity}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.totalAppointments}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin.reports.total')}</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadPDF(report.magazinId, report.magazinName)}
                    loading={downloadingPDF === report.magazinId}
                    disabled={downloadingPDF !== null}
                  >
                    {downloadingPDF === report.magazinId ? t('admin.reports.downloading') : t('admin.reports.actions.downloadPDF')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{report.confirmedAppointments}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">{t('admin.reports.confirmed')}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{report.pendingAppointments}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">{t('admin.reports.pending')}</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{report.canceledAppointments}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">{t('admin.reports.canceled')}</div>
                </div>
              </div>

              {report.appointments.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{t('admin.reports.appointmentDetails')}</h4>
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
                         key: 'service', 
                         header: t('admin.appointments.service'),
                         render: (value: any) => (
                           <div>
                             <div className="font-medium text-gray-900 dark:text-gray-100">{value?.name || 'N/A'}</div>
         
                           </div>
                         )
                       },
                       { 
                         key: 'start', 
                         header: t('admin.reports.time'),
                         render: (value: string, appointment: Appointment) => (
                           <div className="text-sm">
                             <div className="text-gray-900 dark:text-gray-100">{formatDate(value)}</div>
                             <div className="text-gray-500 dark:text-gray-400">{t('admin.reports.to')} {formatDate(appointment.end)}</div>
                           </div>
                         )
                       },
                       { 
                         key: 'status', 
                         header: t('admin.appointments.status'),
                         render: (value: string) => getStatusBadge(value)
                       }
                     ]}
                     data={report.appointments}
                     emptyMessage={t('admin.reports.noAppointmentsFound')}
                   />
                </div>
              )}
            </CardBody>
          </Card>
        ))}

      {dailyReport.length === 0 && !loading && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('admin.reports.noDataAvailable')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('admin.reports.noDataDesc')}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default AdminReports
