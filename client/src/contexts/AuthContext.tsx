import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api, { endpoints } from '../utils/api'

interface User {
  role: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Try to ping an admin endpoint to check if cookie is valid
      const response = await api.get(endpoints.appointments.admin, api.withCredentials())
      
      if (response.ok) {
        setIsAuthenticated(true)
        // You could fetch user details here if needed
        setUser({ role: 'admin' })
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post(endpoints.auth.login, { email, password }, api.withCredentials())

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user || { role: 'admin' })
        return true
      } else {
        const errorData = await response.json()
        console.error('Login failed:', errorData.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await api.post(endpoints.auth.logout, {}, api.withCredentials())
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
