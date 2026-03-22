'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import JobCard from '@/components/JobCard'
import { Button } from '@/components/ui/button'
import { Jobs, Auth } from '@/lib/api'
import Link from 'next/link'

const JobsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [selectedType, setSelectedType] = useState('All')

  type Job = {
    id: string | number
    title: string
    company?: string
    location?: string
    country?: string
    salary?: string
    type?: string
    description?: string
    requirements?: string[]
  }

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)

  const types = ['All', 'Full-time', 'Part-time', 'Contract']

  const sourceJobs = Array.isArray(jobs) ? jobs : []

  const countries = useMemo(() => {
    const list = sourceJobs.map(j => j.country).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(list))]
  }, [sourceJobs])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      try {
        const p = await Auth.me()
        if (mounted) setProfile(p)
      } catch (e) {
        // ignore - user not logged in
      }
    }
    loadProfile()
    async function loadJobs() {
      setLoading(true)
      setError(null)
      try {
        const data = await Jobs.list()
        if (mounted) setJobs(data || [])
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load jobs')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadJobs()
    return () => {
      mounted = false
    }
  }, [])

  const filteredJobs = sourceJobs.filter(job => {
    const getTitleText = (j: any) => {
      const t = j?.title
      if (!t) return ''
      if (typeof t === 'string') return t
      if (typeof t === 'object') return (t.en ?? Object.values(t)[0] ?? '')
      return String(t)
    }

    const titleText = getTitleText(job)
    const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (job.company || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountry === 'All' || job.country === selectedCountry
    const matchesType = selectedType === 'All' || job.type === selectedType
    return matchesSearch && matchesCountry && matchesType
  })

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Available Jobs</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Explore thousands of verified job opportunities with international employers
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-2">Search Jobs</label>
            <input
              type="text"
              placeholder="Job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
            />
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Job Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-foreground/60">
            {loading ? 'Loading jobs...' : error ? `Error: ${error}` : (
              <>Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> of <span className="font-semibold text-foreground">{jobs.length}</span> jobs</>
            )}
          </p>
        </div>

        {/* Partner action: Post Job */}
        {(() => {
          const isPartner = (() => {
            if (!profile) return false
            const role = (profile.role || profile.type || profile.account_type || '').toString().toLowerCase()
            if (role.includes('partner') || role.includes('agency')) return true
            if (profile.is_partner === true) return true
            return false
          })()

          return isPartner ? (
            <div className="mb-6">
              <Link href="/PostJob">
                <Button className="bg-green-600 hover:bg-green-700 text-white">+ Post Job</Button>
              </Link>
            </div>
          ) : null
        })()}

        {/* Job Listings */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-foreground/60 mb-6">Try adjusting your search filters</p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedCountry('All')
                setSelectedType('All')
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

export default JobsPage
