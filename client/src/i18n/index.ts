import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import language files
import en from './en.json'
import fr from './fr.json'
import ar from './ar.json'

// Language configuration
const resources = {
  en: {
    translation: en
  },
  fr: {
    translation: fr
  },
  ar: {
    translation: ar
  }
}

// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur']

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  })

// Helper function to check if language is RTL
export const isRTL = (language: string): boolean => {
  return rtlLanguages.includes(language)
}

// Helper function to get current language direction
export const getCurrentDirection = (): 'ltr' | 'rtl' => {
  return isRTL(i18n.language) ? 'rtl' : 'ltr'
}

// Helper function to change language and update document direction
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language)
  
  // Update document direction for RTL support
  const direction = isRTL(language) ? 'rtl' : 'ltr'
  document.documentElement.dir = direction
  document.documentElement.lang = language
  
  // Add/remove RTL class for styling
  if (direction === 'rtl') {
    document.documentElement.classList.add('rtl')
  } else {
    document.documentElement.classList.remove('rtl')
  }
}

// Initialize document direction on app start
export const initializeLanguage = (): void => {
  const currentLang = i18n.language || 'en'
  const direction = isRTL(currentLang) ? 'rtl' : 'ltr'
  
  document.documentElement.dir = direction
  document.documentElement.lang = currentLang
  
  if (direction === 'rtl') {
    document.documentElement.classList.add('rtl')
  }
}

export default i18n
