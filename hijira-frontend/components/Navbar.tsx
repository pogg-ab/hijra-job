'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

            <Link href="/Login" className="hidden sm:block">
              <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/RegisterMultiStep">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {t('nav.signup')}
              </Button>
            </Link>

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
            <Link href="/Login" className="block mt-2">
              <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
