import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import api, { endpoints } from '../utils/api'

interface AdminData {
  services: any[]
  magazins: any[]
  appointments: any[]
  todayAppointments: any[]
  tomorrowAppointments: any[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface AdminDataContextType {
  data: AdminData
  refreshData: () => Promise<void>
  refreshAppointments: () => Promise<void>
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined)

export const useAdminData = () => {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider')
  }
  return context
}

interface AdminDataProviderProps {
  children: ReactNode
}

export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<AdminData>({
    services: [],
    magazins: [],
    appointments: [],
    todayAppointments: [],
    tomorrowAppointments: [],
    loading: false,
    error: null,
    lastUpdated: null
  })

  const isFetchingRef = useRef(false)
  const dataCacheRef = useRef<{ [key: string]: any }>({})

  const fetchAllData = async () => {
    if (isFetchingRef.current) return
    
    try {
      isFetchingRef.current = true
      setData(prev => ({ ...prev, loading: true, error: null }))

      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Fetch all data in parallel
      const [
        servicesResponse,
        magazinsResponse,
        allAppointmentsResponse,
        todayResponse,
        tomorrowResponse
      ] = await Promise.all([
        api.get(endpoints.services.list, api.withCredentials()),
        api.get(endpoints.magazins.admin, api.withCredentials()),
        api.get(endpoints.appointments.admin, api.withCredentials()),
        api.get(`${endpoints.appointments.admin}?date=${today}`, api.withCredentials()),
        api.get(`${endpoints.appointments.admin}?date=${tomorrow}`, api.withCredentials())
      ])

      // Process responses
      const services = servicesResponse.ok ? (await servicesResponse.json()).data || [] : []
      const magazins = magazinsResponse.ok ? (await magazinsResponse.json()).data || [] : []
      const appointments = allAppointmentsResponse.ok ? (await allAppointmentsResponse.json()).data || [] : []
      const todayAppointments = todayResponse.ok ? (await todayResponse.json()).data || [] : []
      const tomorrowAppointments = tomorrowResponse.ok ? (await tomorrowResponse.json()).data || [] : []

      // Cache the data
      dataCacheRef.current = {
        services,
        magazins,
        appointments,
        todayAppointments,
        tomorrowAppointments
      }

      setData({
        services,
        magazins,
        appointments,
        todayAppointments,
        tomorrowAppointments,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load admin data' 
      }))
    } finally {
      isFetchingRef.current = false
    }
  }

  const refreshData = async () => {
    await fetchAllData()
  }

  const refreshAppointments = async () => {
    if (isFetchingRef.current) return
    
    try {
      isFetchingRef.current = true
      
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [
        allAppointmentsResponse,
        todayResponse,
        tomorrowResponse
      ] = await Promise.all([
        api.get(endpoints.appointments.admin, api.withCredentials()),
        api.get(`${endpoints.appointments.admin}?date=${today}`, api.withCredentials()),
        api.get(`${endpoints.appointments.admin}?date=${tomorrow}`, api.withCredentials())
      ])

      const appointments = allAppointmentsResponse.ok ? (await allAppointmentsResponse.json()).data || [] : []
      const todayAppointments = todayResponse.ok ? (await todayResponse.json()).data || [] : []
      const tomorrowAppointments = tomorrowResponse.ok ? (await tomorrowResponse.json()).data || [] : []

      // Update cache
      dataCacheRef.current.appointments = appointments
      dataCacheRef.current.todayAppointments = todayAppointments
      dataCacheRef.current.tomorrowAppointments = tomorrowAppointments

      setData(prev => ({
        ...prev,
        appointments,
        todayAppointments,
        tomorrowAppointments,
        lastUpdated: new Date()
      }))

    } catch (error) {
      console.error('Error refreshing appointments:', error)
    } finally {
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    // Only fetch data once when the provider mounts
    if (!isFetchingRef.current && data.services.length === 0) {
      fetchAllData()
    }
  }, [])

  const value: AdminDataContextType = {
    data,
    refreshData,
    refreshAppointments
  }

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  )
}
