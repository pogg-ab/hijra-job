'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AboutPage } from '@/lib/api'

type SectionBlock = {
  key: string
  title: string | null
  description: string | null
  content: Record<string, any> | null
  is_active: boolean
}

type AboutPayload = {
  company_background: SectionBlock | null
  mission: SectionBlock | null
  vision: SectionBlock | null
  legal_compliance: SectionBlock | null
  recruitment_standards: SectionBlock | null
  certifications: SectionBlock | null
}

function listFromUnknown(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export default function AboutPageView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<AboutPayload | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const response = await AboutPage.get()
        const payload = (response as any)?.data as AboutPayload
        if (mounted) setData(payload)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load About page')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const certifications = useMemo(
    () => listFromUnknown(data?.certifications?.content?.items),
    [data?.certifications?.content?.items]
  )

  const legalCompliancePoints = useMemo(
    () => listFromUnknown(data?.legal_compliance?.content?.compliance_points),
    [data?.legal_compliance?.content?.compliance_points]
  )

  const recruitmentStandards = useMemo(
    () => listFromUnknown(data?.recruitment_standards?.content?.standards),
    [data?.recruitment_standards?.content?.standards]
  )

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-linear-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3.2 About Us Page</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4">About Hijra</h1>
          <p className="text-lg text-foreground/70 max-w-3xl">Learn about our background, mission, legal standards, and recruitment quality commitments.</p>
        </div>
      </section>

      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 space-y-8">
        {loading && <p className="text-foreground/70">Loading about page content...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {!loading && !error && (
          <>
            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">{data?.company_background?.title || 'Company Background'}</h2>
              <p className="mt-3 text-foreground/75 leading-relaxed">{data?.company_background?.description || 'Company background information is being updated.'}</p>
            </article>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">{data?.mission?.title || 'Mission'}</h2>
                <p className="mt-3 text-foreground/75 leading-relaxed">{data?.mission?.description || 'Mission details are being updated.'}</p>
              </article>
              <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">{data?.vision?.title || 'Vision'}</h2>
                <p className="mt-3 text-foreground/75 leading-relaxed">{data?.vision?.description || 'Vision details are being updated.'}</p>
              </article>
            </div>

            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">{data?.legal_compliance?.title || 'Legal Compliance'}</h2>
              <p className="mt-3 text-foreground/75 leading-relaxed">{data?.legal_compliance?.description || 'Legal compliance details are being updated.'}</p>
              {legalCompliancePoints.length > 0 && (
                <ul className="mt-4 space-y-2 text-foreground/80">
                  {legalCompliancePoints.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">{data?.recruitment_standards?.title || 'Recruitment Standards'}</h2>
              <p className="mt-3 text-foreground/75 leading-relaxed">{data?.recruitment_standards?.description || 'Recruitment standards details are being updated.'}</p>
              {recruitmentStandards.length > 0 && (
                <ul className="mt-4 space-y-2 text-foreground/80">
                  {recruitmentStandards.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">{data?.certifications?.title || 'Certifications'}</h2>
              <p className="mt-3 text-foreground/75 leading-relaxed">{data?.certifications?.description || 'Certification details are being updated.'}</p>
              {certifications.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {certifications.map((item) => (
                    <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </>
        )}
      </section>

      <Footer />
    </main>
  )
}
