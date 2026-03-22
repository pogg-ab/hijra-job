'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Services } from '@/lib/api'

export default function ServicesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await Services.list()
        const list = Array.isArray(res) ? res : (res.data ?? [])
        if (mounted) setItems(list)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load services')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('services.title')}</h1>
          <p className="text-lg text-foreground/60 max-w-3xl">{t('services.intro')}</p>
        </div>
      </section>

      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {loading && <div className="text-center text-foreground/60">{t('services.loading')}</div>}
        {error && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((service) => (
              <div key={service.id} className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-3">{service.title}</h2>
                <p className="text-foreground/70">{service.description}</p>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-foreground/60">{t('services.none')}</div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
