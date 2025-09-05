import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { initializeLanguage } from './i18n'
import { AuthProvider } from './contexts/AuthContext'
import { AdminDataProvider } from './contexts/AdminDataContext'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'

// Public Pages
import Home from './pages/Home'
import Services from './pages/Services'
import Locations from './pages/Locations'
import Appointments from './pages/Appointments'
import Magazins from './pages/Magazins'
import MagazinDetail from './pages/MagazinDetail'

import BookingStatus from './pages/BookingStatus'
import CheckAppointment from './pages/CheckAppointment'

// Admin Pages
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMagazins from './pages/admin/Magazins'
import AdminServices from './pages/admin/Services'
import AdminAppointments from './pages/admin/Appointments'
import AdminCalendar from './pages/admin/Calendar'
import AdminReports from './pages/admin/Reports'

const App: React.FC = () => {
  useEffect(() => {
    // Initialize language and document direction
    initializeLanguage()
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/book" element={<Appointments />} />
                <Route path="/magazins" element={<Magazins />} />
                <Route path="/magazins/:id" element={<MagazinDetail />} />
        
                <Route path="/booking/:reference" element={<BookingStatus />} />
                <Route path="/check" element={<CheckAppointment />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminDashboard />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/magazins"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminMagazins />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminServices />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/appointments"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminAppointments />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/calendar"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminCalendar />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <AdminRoute>
                      <AdminDataProvider>
                        <AdminReports />
                      </AdminDataProvider>
                    </AdminRoute>
                  }
                />

                {/* 404 - Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
