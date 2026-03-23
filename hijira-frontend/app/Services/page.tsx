'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Services } from '@/lib/api'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await Services.list()
        const list = Array.isArray(res) ? res : (res.data ?? [])
        if (mounted) setServices(list)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load services')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const normalizedServices = useMemo(() => {
    const toStringArray = (value: unknown): string[] => {
      if (!Array.isArray(value)) return []
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0)
    }

    return services.map((item) => ({
      ...item,
      id: item.id,
      slug: item.slug,
      title: item.title ?? 'Untitled Service',
      description: item.description ?? '',
      qualificationRequirements: toStringArray(item.qualification_requirements),
      targetCountries: toStringArray(item.target_countries),
      applicationInstructions: toStringArray(item.application_instructions),
    }))
  }, [services])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-linear-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3.3 Services Page</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4">Services Offered by Hijira Agency</h1>
          <p className="text-lg text-foreground/60 max-w-3xl">
            Explore key recruitment categories and detailed requirements before applying.
          </p>
        </div>
      </section>

      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {loading && <p className="text-foreground/70">Loading services...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {!loading && !error && normalizedServices.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {normalizedServices.map((service) => (
              <article id={service.slug ?? String(service.id)} key={service.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-foreground">{service.title}</h2>

                <section className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Description</h3>
                  <p className="mt-2 text-foreground/75 leading-relaxed">{service.description || 'No description available yet.'}</p>
                </section>

                <section className="mt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Qualification Requirements</h3>
                  {service.qualificationRequirements.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-foreground/75">
                      {service.qualificationRequirements.map((item: string) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-foreground/60">No qualification requirements listed.</p>
                  )}
                </section>

                <section className="mt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Target Countries</h3>
                  {service.targetCountries.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {service.targetCountries.map((country: string) => (
                        <span key={country} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {country}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-foreground/60">No target countries listed.</p>
                  )}
                </section>

                <section className="mt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Application Instructions</h3>
                  {service.applicationInstructions.length > 0 ? (
                    <ol className="mt-2 space-y-1 text-foreground/75">
                      {service.applicationInstructions.map((step: string, idx: number) => (
                        <li key={step} className="flex gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-foreground/60">No application instructions listed.</p>
                  )}
                </section>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && normalizedServices.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-foreground/70">No services are available yet. Please check back soon.</p>
          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
