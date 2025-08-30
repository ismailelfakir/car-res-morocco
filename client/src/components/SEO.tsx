import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
  type?: 'website' | 'article' | 'service'
  structuredData?: object
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonical,
  type = 'website',
  structuredData
}) => {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Set document title
    const pageTitle = title || t('seo.defaultTitle')
    document.title = pageTitle

    // Set meta description
    const metaDescription = description || t('seo.defaultDescription')
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', metaDescription)

    // Set meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }

    // Set Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle)
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', metaDescription)
    }

    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]')
      if (ogImg) {
        ogImg.setAttribute('content', ogImage)
      }
    }

    // Set Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image')
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', pageTitle)
    }

    const twitterDesc = document.querySelector('meta[name="twitter:description"]')
    if (twitterDesc) {
      twitterDesc.setAttribute('content', metaDescription)
    }

    // Set additional meta tags
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (!metaViewport) {
      const viewport = document.createElement('meta')
      viewport.setAttribute('name', 'viewport')
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
      document.head.appendChild(viewport)
    }

    // Set robots meta tag
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      const robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      robots.setAttribute('content', 'index, follow')
      document.head.appendChild(robots)
    }

    // Set author meta tag
    const metaAuthor = document.querySelector('meta[name="author"]')
    if (!metaAuthor) {
      const author = document.createElement('meta')
      author.setAttribute('name', 'author')
      author.setAttribute('content', 'CarTech Morocco')
      document.head.appendChild(author)
    }

    // Set geo meta tags for Morocco
    const metaGeoRegion = document.querySelector('meta[name="geo.region"]')
    if (!metaGeoRegion) {
      const geoRegion = document.createElement('meta')
      geoRegion.setAttribute('name', 'geo.region')
      geoRegion.setAttribute('content', 'MA')
      document.head.appendChild(geoRegion)
    }

    const metaGeoCountry = document.querySelector('meta[name="geo.country"]')
    if (!metaGeoCountry) {
      const geoCountry = document.createElement('meta')
      geoCountry.setAttribute('name', 'geo.country')
      geoCountry.setAttribute('content', 'Morocco')
      document.head.appendChild(geoCountry)
    }

    // Set canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonical)
    }

    // Set language
    document.documentElement.lang = i18n.language

    // Add structured data if provided
    if (structuredData) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Reset to default title when component unmounts
      document.title = t('seo.defaultTitle')
      
      // Remove structured data script
      const structuredDataScript = document.querySelector('script[type="application/ld+json"]')
      if (structuredDataScript) {
        structuredDataScript.remove()
      }
    }
  }, [title, description, keywords, ogImage, canonical, type, structuredData, t, i18n.language])

  return null
}

export default SEO
