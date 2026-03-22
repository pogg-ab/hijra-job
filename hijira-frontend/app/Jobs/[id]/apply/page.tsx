"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Jobs, Auth, Applications } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function JobApplyPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id

  const [job, setJob] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      try {
        const data = await Jobs.show(id)
        if (mounted) setJob(data)
        try {
          const p = await Auth.me()
          if (mounted) setProfile(p)
        } catch {
          // ignore
        }
        try {
          const myApps = await Applications.myApplications()
          const apps = myApps?.data ?? myApps
          if (mounted) setApplied(Array.isArray(apps) ? apps.some((a: any) => String(a.job_id) === String(id)) : false)
        } catch {
          // ignore
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Failed to load job')
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const needsVerified = job?.is_high_level === true

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!id) return setError('Missing job id')
    // No document verification gating; users may apply if the job is published.
    setLoading(true)
    try {
      await Jobs.apply(id, { cover_letter: coverLetter })
      setSuccess('Application submitted successfully')
      setTimeout(() => router.push('/Dashboard'), 1200)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <Button onClick={() => router.back()} className="mb-6">← Back</Button>

        {job && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{(typeof job.title === 'string') ? job.title : (job.title?.en ?? Object.values(job.title || {})[0] ?? '')}</h1>
            <p className="text-foreground/60">{job.country ?? ''} • {job.vacancies_total ?? ''} vacancies • {((job.vacancies_total ?? 0) - (job.vacancies_filled ?? 0))} remaining</p>
          </div>
        )}

        {error && <div className="text-destructive mb-4">Error: {error}</div>}
        
        {success && <div className="text-success mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Cover Letter</label>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" rows={8} />
          </div>

          <div>
            {applied ? (
              <div className="text-muted">You have already applied for this job.</div>
            ) : ((job?.vacancies_total ?? 0) - (job?.vacancies_filled ?? 0)) <= 0 ? (
              <div className="text-destructive">No vacancies available for this job.</div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                aria-disabled={loading}
                title={loading ? 'Submitting...' : ''}
                className={`inline-flex items-center px-4 py-2 rounded-md text-white ${loading ? 'bg-primary/60 opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </main>
  )
}
