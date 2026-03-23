'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HomePage } from '@/lib/api'

type SectionBlock = {
  key: string
  title: string | null
  subtitle: string | null
  description: string | null
  content: Record<string, any> | null
  is_active: boolean
}

type ServiceItem = {
  id: number
  title: string
  description: string | null
}

type CountryItem = {
  id: number
  country_name: string
}

type TestimonialItem = {
  id: number
  author_name: string
  author_role: string | null
  quote: string
}

type JobItem = {
  id: number
  title: string | Record<string, string>
  description: string | Record<string, string> | null
  category: string | null
  country: string | null
  salary_range: string | null
}

type HomePayload = {
  company_introduction: SectionBlock | null
  mission_vision: SectionBlock | null
  featured_services: ServiceItem[]
  quick_job_search: SectionBlock | null
  latest_job_listings: {
    config: SectionBlock | null
    items: JobItem[]
  }
  partner_countries: CountryItem[]
  testimonials: TestimonialItem[]
  contact_section: SectionBlock | null
}

function getLocalizedValue(value: string | Record<string, string> | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.en ?? Object.values(value)[0] ?? ''
}

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<HomePayload | null>(null)
  const [quickKeyword, setQuickKeyword] = useState('')
  const [quickCountry, setQuickCountry] = useState('')
  const [searchApplied, setSearchApplied] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const response = await HomePage.get()
        const payload = (response as any)?.data as HomePayload
        if (mounted) setData(payload)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load homepage')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const intro = data?.company_introduction
  const missionVision = data?.mission_vision
  const quickSearch = data?.quick_job_search
  const latestConfig = data?.latest_job_listings?.config
  const latestJobs = data?.latest_job_listings?.items ?? []
  const featuredServices = data?.featured_services ?? []
  const countries = data?.partner_countries ?? []
  const testimonials = data?.testimonials ?? []
  const contact = data?.contact_section

  const filteredLatestJobs = useMemo(() => {
    const keyword = quickKeyword.trim().toLowerCase()
    const country = quickCountry.trim().toLowerCase()

    return latestJobs.filter((job) => {
      const titleText = getLocalizedValue(job.title).toLowerCase()
      const descText = getLocalizedValue(job.description).toLowerCase()
      const jobCountry = (job.country ?? '').toLowerCase()

      const keywordMatch = !keyword || titleText.includes(keyword) || descText.includes(keyword)
      const countryMatch = !country || jobCountry.includes(country)

      return keywordMatch && countryMatch
    })
  }, [latestJobs, quickKeyword, quickCountry])

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchApplied(true)

    const latestSection = document.getElementById('latest-job-listings')
    if (latestSection) {
      latestSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const highlights = useMemo(() => {
    const jobsCount = latestJobs.length
    const countriesCount = countries.length
    const servicesCount = featuredServices.length

    return [
      { value: `${jobsCount}+`, label: 'Latest Open Jobs' },
      { value: `${countriesCount}`, label: 'Partner Countries' },
      { value: `${servicesCount}`, label: 'Featured Services' },
      { value: '24/7', label: 'Support Desk' },
    ]
  }, [latestJobs.length, countries.length, featuredServices.length])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {error && (
        <div className="mx-auto mt-6 w-full max-w-6xl px-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="relative overflow-hidden px-4 pt-16 pb-20 md:pt-24 md:pb-28 bg-linear-to-b from-primary/10 via-background to-background">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              3.1 Home Page
            </p>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-tight text-foreground">
              {intro?.title || 'Company Introduction'}
            </h1>
            <p className="mt-5 text-lg text-foreground/75 leading-relaxed">
              {intro?.description || 'Hijra Global Recruitment Platform introduces a trusted agency that connects Ethiopian talent with verified international employers through transparent, safe, and professional recruitment.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={(intro?.content?.primary_cta_link as string) || '/Jobs'}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {(intro?.content?.primary_cta_text as string) || 'Explore Jobs'}
                </Button>
              </Link>
              <Link href={(intro?.content?.secondary_cta_link as string) || '/RegisterMultiStep'}>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
                  {(intro?.content?.secondary_cta_text as string) || 'Create Profile'}
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Agency Highlights</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                  <p className="text-sm text-foreground/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-background">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">
              {(missionVision?.content?.mission_title as string) || 'Mission'}
            </h2>
            <p className="mt-3 text-foreground/75 leading-relaxed">
              {(missionVision?.content?.mission_text as string) || 'Build a reliable path for Ethiopian job seekers to access ethical and verified international work opportunities.'}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">
              {(missionVision?.content?.vision_title as string) || 'Vision'}
            </h2>
            <p className="mt-3 text-foreground/75 leading-relaxed">
              {(missionVision?.content?.vision_text as string) || 'Become the leading recruitment bridge in the region with a platform focused on trust, compliance, and worker wellbeing.'}
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center">Featured Services</h2>
          <p className="mt-3 text-center text-foreground/70">Services managed from admin panel</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredServices.map((service, index) => (
              <article key={service.id ?? index} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md hover:-translate-y-0.5">
                <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">SV{index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{service.title}</h3>
                <p className="mt-2 text-foreground/70 leading-relaxed">{service.description}</p>
              </article>
            ))}
            {featuredServices.length === 0 && (
              <p className="md:col-span-3 rounded-xl border border-dashed border-border bg-card p-6 text-center text-foreground/70">
                No featured services available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-background">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-foreground">{quickSearch?.title || 'Quick Job Search'}</h2>
          <p className="mt-2 text-foreground/70">{quickSearch?.description || 'Find opportunities by keyword and destination country.'}</p>
          <form onSubmit={handleQuickSearchSubmit} className="mt-6 grid gap-4 md:grid-cols-4">
            <input
              value={quickKeyword}
              onChange={(e) => setQuickKeyword(e.target.value)}
              placeholder={(quickSearch?.content?.placeholder_keyword as string) || 'Job title or keyword'}
              className="md:col-span-2 rounded-lg border border-border bg-background px-4 py-3"
            />
            <input
              value={quickCountry}
              onChange={(e) => setQuickCountry(e.target.value)}
              placeholder={(quickSearch?.content?.placeholder_country as string) || 'Country'}
              className="rounded-lg border border-border bg-background px-4 py-3"
            />
            <button type="submit" className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {(quickSearch?.content?.search_button_text as string) || 'Search'}
            </button>
          </form>
        </div>
      </section>

      <section id="latest-job-listings" className="px-4 py-16 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl font-bold text-foreground">{latestConfig?.title || 'Latest Job Listings'}</h2>
            <Link href={(latestConfig?.content?.view_all_link as string) || '/Jobs'} className="text-sm font-semibold text-primary hover:underline">
              {(latestConfig?.content?.view_all_text as string) || 'View all'}
            </Link>
          </div>

          {searchApplied && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-foreground/70">
                Showing results for
                {quickKeyword.trim() ? ` keyword: "${quickKeyword.trim()}"` : ' all keywords'}
                {quickCountry.trim() ? `, country: "${quickCountry.trim()}"` : ''}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuickKeyword('')
                  setQuickCountry('')
                  setSearchApplied(false)
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {filteredLatestJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground">{getLocalizedValue(job.title)}</h3>
                <p className="mt-1 text-sm text-foreground/70">{getLocalizedValue(job.description) || job.category || 'General'}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{job.country || 'N/A'}</span>
                  <span className="font-medium text-foreground/80">{job.salary_range || 'Negotiable'}</span>
                </div>
              </article>
            ))}
            {filteredLatestJobs.length === 0 && (
              <p className="md:col-span-3 rounded-xl border border-dashed border-border bg-card p-6 text-center text-foreground/70">
                No jobs match your quick search.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground">Partner Countries</h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {countries.map((country) => (
              <div key={country.id} className="rounded-xl border border-border bg-card px-4 py-5 text-center font-medium text-foreground/80">
                {country.country_name}
              </div>
            ))}
            {countries.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-border bg-card p-6 text-center text-foreground/70">
                No partner countries added yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground">Testimonials</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-foreground/80 leading-relaxed">{item.quote}</p>
                <footer className="mt-4 text-sm font-semibold text-primary">
                  {item.author_name}
                  {item.author_role ? `, ${item.author_role}` : ''}
                </footer>
              </blockquote>
            ))}
            {testimonials.length === 0 && (
              <p className="md:col-span-3 rounded-xl border border-dashed border-border bg-card p-6 text-center text-foreground/70">
                No testimonials available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-background">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{contact?.title || 'Contact Section'}</h2>
            <p className="mt-3 text-foreground/75 leading-relaxed">
              {contact?.description || 'Reach our team for inquiries about recruitment, partnership, and candidate onboarding.'}
            </p>
            <div className="mt-6 space-y-2 text-foreground/80">
              <p>Email: {(contact?.content?.email as string) || 'info@hijra.global'}</p>
              <p>Phone: {(contact?.content?.phone as string) || '+251 11 000 0000'}</p>
              <p>Address: {(contact?.content?.address as string) || 'Addis Ababa, Ethiopia'}</p>
            </div>
          </div>

          <form className="rounded-2xl border border-border bg-card p-6 shadow-sm grid gap-4">
            <input placeholder="Full name" className="rounded-lg border border-border bg-background px-4 py-3" />
            <input placeholder="Email address" className="rounded-lg border border-border bg-background px-4 py-3" />
            <textarea placeholder="Write your message" className="h-32 rounded-lg border border-border bg-background px-4 py-3" />
            <button type="button" className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {(contact?.content?.submit_button_text as string) || 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {loading && <p className="mx-auto mb-8 text-sm text-foreground/70">Loading homepage content...</p>}

      <Footer />
    </main>
  )
}

export default Home
