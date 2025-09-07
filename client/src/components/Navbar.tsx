import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { changeLanguage } from '../i18n'
import { useAuth } from '../contexts/AuthContext'
import Button from './ui/Button'
import { useTheme } from '../contexts/ThemeContext'

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, logout } = useAuth()
  const currentLang = i18n.language
  const { theme, toggleTheme } = useTheme()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode)
  }

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="automobilti-logo" className="h-32 w-36 object-contain shrink-0" />
            </Link>
            
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.home')}
            </Link>
            <Link
              to="/services"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.services')}
            </Link>
            <Link
              to="/magazins"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.locations')}
            </Link>
            <Link
              to="/appointments"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.appointments')}
            </Link>
            <Link
              to="/check"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.checkAppointment', { defaultValue: 'Check Appointment' })}
            </Link>
          </div>

          {/* Right Side - Language Switcher and Auth */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 dark:text-gray-200"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <svg className={`w-5 h-5 ${theme === 'dark' ? '' : 'hidden'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'hidden' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
            </Button>
            {/* Language Switcher */}
            <div className="hidden md:block relative group">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>{languages.find(lang => lang.code === currentLang)?.flag}</span>
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === currentLang)?.code.toUpperCase()}
                </span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {/* Language Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                        ${currentLang === language.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}
                      `}
                    >
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth Buttons (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('navigation.logout')}
                </Button>
              ) : null}
            </div>

            {/* Mobile hamburger (right) */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(prev => !prev)}
            >
              <svg className={`h-6 w-6 ${mobileOpen ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`h-6 w-6 ${mobileOpen ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div className={`md:hidden border-t border-gray-200 dark:border-gray-800 ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-3 pb-4 space-y-1 bg-white dark:bg-gray-900">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
            {t('navigation.home')}
          </Link>
          <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
            {t('navigation.services')}
          </Link>
          <Link to="/magazins" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
            {t('navigation.locations')}
          </Link>
          <Link to="/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
            {t('navigation.appointments')}
          </Link>
          <Link to="/check" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
            {t('navigation.checkAppointment', { defaultValue: 'Check Appointment' })}
          </Link>

          {/* Language quick toggle */}
          <div className="mt-2 flex items-center gap-2 px-3">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`px-2 py-1 rounded text-sm ${currentLang === language.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {language.flag} {language.code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Auth (mobile) */}
          <div className="mt-2 px-3 flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => { setMobileOpen(false); logout() }}>
                {t('navigation.logout')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
