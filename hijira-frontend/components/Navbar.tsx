'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAccessToken, clearAuth, Auth, Services } from '@/lib/api'
import { useTranslation } from 'react-i18next'
import { AppLanguage } from '@/lib/i18n'
import { useLanguage } from '@/components/language-provider'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  const links = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.jobs'), href: '/Jobs' },
    { label: t('nav.services'), href: '/Services' },
    { label: t('nav.contact'), href: '/Contact' },
  ]

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isPartnerUser, setIsPartnerUser] = useState<boolean>(false)
  const [servicesList, setServicesList] = useState<any[]>([])

  useEffect(() => {
    // determine auth client-side only to keep server/client HTML stable
    try {
      const hasToken = !!getAccessToken()
      setIsAuthenticated(hasToken)

      if (hasToken) {
        let mounted = true
        ;(async () => {
          try {
            const me = await Auth.me()
            const role = me?.user?.role ?? me?.role ?? null
            if (!mounted) return
            setIsPartnerUser(role === 'partner' || role === 'agency')
          } catch {
            // on failure (401/invalid token) clear auth state
            try { clearAuth() } catch {}
            setIsAuthenticated(false)
            setIsPartnerUser(false)
          }
        })()

        return () => { mounted = false }
      }
    } catch {
      setIsAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await Services.list()
        const list = Array.isArray(res) ? res : (res.data ?? [])
        if (mounted) setServicesList(list)
      } catch {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">Hijra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, idx) => {
              const href = idx === 0 && isAuthenticated ? '/Dashboard' : link.href
              const label = idx === 0 && isAuthenticated ? 'Dashboard' : link.label
              // Render Services as a dropdown if services exist
              if (link.href === '/Services') {
                return (
                  <div key={href + idx} className="relative group">
                    <Link href={href}>
                      <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">{label}</Button>
                    </Link>
                    {servicesList.length > 0 && (
                      <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded shadow-md z-40 hidden group-hover:block">
                        <div className="py-2">
                          {servicesList.map(s => (
                            <Link key={s.id} href={`/Services#${s.slug ?? s.id}`} className="block px-4 py-2 text-sm text-foreground hover:bg-primary/5">{s.title}</Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div key={href + idx} className="flex items-center gap-1">
                  <Link href={href}>
                    <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">
                      {label}
                    </Button>
                  </Link>
                  {/* Insert Applications next to Jobs for partner users */}
                  {link.href === '/Jobs' && isPartnerUser && (
                    <Link href="/Partner">
                      <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">Applications</Button>
                    </Link>
                  )}
                </div>
              )
            })}
            {/* partner/register links hidden for guests per request */}
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
                <Link href="/Profile">
                  <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5" aria-label="Profile">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                    </svg>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await Auth.logout()
                    } catch {
                      // ignore
                    }
                    clearAuth()
                    window.location.href = '/Login'
                  }}
                  className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/Login" className="hidden sm:block">
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40">
                    {t('nav.login')}
                  </Button>
                </Link>
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
            {links.map((link, idx) => {
              const href = idx === 0 && isAuthenticated ? '/Dashboard' : link.href
              const label = idx === 0 && isAuthenticated ? 'Dashboard' : link.label
              return (
                <div key={href + idx}>
                  <Link href={href}>
                    <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/5">
                      {label}
                    </Button>
                  </Link>
                  {link.href === '/Jobs' && isPartnerUser && (
                    <Link href="/Partner">
                      <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/5">Applications</Button>
                    </Link>
                  )}
                </div>
              )
            })}

            {isAuthenticated ? (
              <>
                <Link href="/Profile" className="block mt-2">
                  <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">Profile</Button>
                </Link>
                {isPartnerUser && (
                  <Link href="/Partner" className="block mt-2">
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">Applications</Button>
                  </Link>
                )}
                <button
                  onClick={async () => {
                    try { await Auth.logout() } catch {}
                    clearAuth()
                    window.location.href = '/Login'
                  }}
                  className="block mt-2 w-full text-left"
                >
                  <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">Logout</Button>
                </button>
              </>
            ) : (
              <>
                <Link href="/Login" className="block mt-2">
                  <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                    {t('nav.login')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
