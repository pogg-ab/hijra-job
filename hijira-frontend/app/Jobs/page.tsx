'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import JobCard from '@/components/JobCard'
import { Button } from '@/components/ui/button'
import { Jobs, Auth } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const JobsPage: React.FC = () => {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('All')

  type Job = {
    id: string | number
    title: any
    employer?: string
    location?: string
    country?: string
    salaryRange?: string
    type?: string
    skillCategory?: string
    description?: any
    requiredQualifications?: string[]
    applicationDeadline?: string | null
  }

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [postOpen, setPostOpen] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')
  const [postCategory, setPostCategory] = useState('')
  const [postJobType, setPostJobType] = useState('Full-time')
  const [postSkillCategory, setPostSkillCategory] = useState('')
  const [postEmployer, setPostEmployer] = useState('')
  const [postCountry, setPostCountry] = useState('')
  const [postVacancies, setPostVacancies] = useState(1)
  const [postSalaryRange, setPostSalaryRange] = useState('')
  const [postApplicationDeadline, setPostApplicationDeadline] = useState('')
  const [postRequiredQualifications, setPostRequiredQualifications] = useState('')
  const [postIsHighLevel, setPostIsHighLevel] = useState(false)

  const sourceJobs = Array.isArray(jobs) ? jobs : []

  const isPartner = useMemo(() => {
    if (!profile) return false
    const role = (profile.role || profile.type || profile.account_type || '').toString().toLowerCase()
    if (role.includes('partner') || role.includes('agency')) return true
    return profile.is_partner === true
  }, [profile])

  function normalizeJobs(data: any[]): Job[] {
    return data.map((job: any) => ({
      id: job.id,
      title: job.title,
      employer: job.employer_name || job.foreign_agency?.company_name || 'Employer not specified',
      location: job.country,
      country: job.country,
      salaryRange: job.salary_range,
      type: job.job_type || 'Full-time',
      skillCategory: job.skill_category || job.category || 'General',
      description: job.description,
      requiredQualifications: Array.isArray(job.required_qualifications) ? job.required_qualifications : [],
      applicationDeadline: job.application_deadline || null,
    }))
  }

  const types = useMemo(() => {
    const list = sourceJobs.map((j) => j.type).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(list))]
  }, [sourceJobs])

  const skillCategories = useMemo(() => {
    const list = sourceJobs.map((j) => j.skillCategory).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(list))]
  }, [sourceJobs])

  const countries = useMemo(() => {
    const list = sourceJobs.map(j => j.country).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(list))]
  }, [sourceJobs])

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    const country = searchParams.get('country') ?? 'All'

    setSearchQuery(q)
    setSelectedCountry(country || 'All')
  }, [searchParams])

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
        if (mounted) setJobs(normalizeJobs(Array.isArray(data) ? data : []))
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
                         (job.employer || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountry === 'All' || job.country === selectedCountry
    const matchesType = selectedType === 'All' || job.type === selectedType
    const matchesSkillCategory = selectedSkillCategory === 'All' || job.skillCategory === selectedSkillCategory
    return matchesSearch && matchesCountry && matchesType && matchesSkillCategory
  })

  async function handlePartnerPostJob(e: React.FormEvent) {
    e.preventDefault()
    setPostError(null)

    if (!Number.isFinite(postVacancies) || Number(postVacancies) < 1) {
      setPostError('Vacancies is required and must be at least 1.')
      return
    }

    setPosting(true)

    try {
      const payload = {
        title: { en: postTitle },
        description: { en: postDescription },
        category: postCategory,
        job_type: postJobType,
        skill_category: postSkillCategory || postCategory,
        employer_name: postEmployer || undefined,
        country: postCountry,
        vacancies_total: Number(postVacancies),
        salary_range: postSalaryRange || undefined,
        application_deadline: postApplicationDeadline || undefined,
        required_qualifications: postRequiredQualifications
          .split(/\n|,/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
        is_high_level: postIsHighLevel || undefined,
      }

      await Jobs.partnerCreate(payload)

      const data = await Jobs.list()
      setJobs(normalizeJobs(Array.isArray(data) ? data : []))

      setPostTitle('')
      setPostDescription('')
      setPostCategory('')
      setPostJobType('Full-time')
      setPostSkillCategory('')
      setPostEmployer('')
      setPostCountry('')
      setPostVacancies(1)
      setPostSalaryRange('')
      setPostApplicationDeadline('')
      setPostRequiredQualifications('')
      setPostIsHighLevel(false)
      setPostOpen(false)
    } catch (err: any) {
      setPostError(err?.message || 'Failed to submit job')
    } finally {
      setPosting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header */}
      <section className="bg-linear-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Available Jobs</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Explore thousands of verified job opportunities with international employers
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Filters */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-2">Search Jobs</label>
            <input
              type="text"
              placeholder="Job title or employer..."
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

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Skill Category</label>
            <select
              value={selectedSkillCategory}
              onChange={(e) => setSelectedSkillCategory(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
            >
              {skillCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
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
        {isPartner && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-800">Partner Quick Action</p>
              <p className="text-sm text-emerald-700/90">Create and publish a job without leaving this page.</p>
            </div>
            <Button onClick={() => { setPostError(null); setPostOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              + Post Job
            </Button>
          </div>
        )}

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
                setSelectedSkillCategory('All')
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Job</DialogTitle>
            <DialogDescription>Create a new listing with full job details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePartnerPostJob} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Job Title (EN)</label>
              <input required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Job Description (EN)</label>
              <textarea required value={postDescription} onChange={(e) => setPostDescription(e.target.value)} rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                <input required value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Job Type</label>
                <select value={postJobType} onChange={(e) => setPostJobType(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Skill Category</label>
                <input value={postSkillCategory} onChange={(e) => setPostSkillCategory(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Employer</label>
                <input value={postEmployer} onChange={(e) => setPostEmployer(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Country</label>
                <input required value={postCountry} onChange={(e) => setPostCountry(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Application Deadline</label>
                <input type="date" value={postApplicationDeadline} onChange={(e) => setPostApplicationDeadline(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Vacancies</label>
                <input required min={1} type="number" value={postVacancies} onChange={(e) => setPostVacancies(Number(e.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Salary Range</label>
                <input value={postSalaryRange} onChange={(e) => setPostSalaryRange(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={postIsHighLevel} onChange={(e) => setPostIsHighLevel(e.target.checked)} />
                  High level
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Required Qualifications (one per line)</label>
              <textarea value={postRequiredQualifications} onChange={(e) => setPostRequiredQualifications(e.target.value)} rows={4} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </div>

            {postError && <p className="text-sm text-red-600">{postError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPostOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={posting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {posting ? 'Submitting...' : 'Submit Job'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}

export default JobsPage
