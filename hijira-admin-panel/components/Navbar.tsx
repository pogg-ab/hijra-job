'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAdminToken, clearAdminAuth, Auth } from '@/lib/api'
import { useTranslation } from 'react-i18next'
import { AppLanguage } from '@/lib/i18n'
import { useLanguage } from '@/components/language-provider'
import { usePathname } from 'next/navigation'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()

  // hide navbar on the login page
  if (pathname && pathname.toLowerCase() === '/login') {
    return null
  }

  useEffect(() => {
    setIsAuthenticated(Boolean(getAdminToken()))
  }, [])

  const links = [
    { label: 'Dashboard', href: '/Dashboard' },
    { label: 'Homepage', href: '/Homepage' },
    { label: 'About', href: '/About' },
    { label: 'Services', href: '/Services' },
    { label: 'Policies', href: '/Policies' },
    { label: 'FAQ', href: '/FAQ' },
    { label: 'Messages', href: '/Messages' },
    { label: 'Staff', href: '/Staff' },
  ]

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">Hijra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Language switcher"
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="h-9 rounded-md border border-primary/20 bg-background px-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary"
            >
              <option value="en">EN</option>
              <option value="am">AM</option>
              <option value="ar">AR</option>
              <option value="or">OR</option>
            </select>

            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await Auth.logout()
                    } catch {
                      // ignore
                    }
                    clearAdminAuth()
                    setIsAuthenticated(false)
                    window.location.href = '/Login'
                  }}
                  className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 ml-3"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="ml-3 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40">
                  <Link href="/Login" className="hidden sm:block">
                    {t('nav.login')}
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-primary/5 rounded-lg transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

          {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border pb-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/5">
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                className="block mt-2"
                onClick={async () => {
                  try {
                    await Auth.logout()
                  } catch {
                    // ignore
                  }
                  clearAdminAuth()
                  setIsAuthenticated(false)
                  window.location.href = '/Login'
                }}
              >
                Logout
              </Button>
            ) : (
              <Button asChild className="block mt-2">
                <Link href="/Login" className="w-full">
                  <span className="w-full inline-block text-center py-2">{t('nav.login')}</span>
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
