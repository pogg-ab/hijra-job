"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Jobs } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function JobDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id

  const [job, setJob] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await Jobs.show(id)
        if (mounted) setJob(data)
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Failed to load job')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <Button onClick={() => router.back()} className="mb-6">← Back</Button>

        {loading && <p>Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {job && (
          <article>
            <h1 className="text-3xl font-bold mb-2">{(typeof job.title === 'string') ? job.title : (job.title?.en ?? Object.values(job.title || {})[0] ?? '')}</h1>
            <p className="text-foreground/60 mb-4">{job.country ?? ''} • {job.vacancies_total ?? ''} vacancies • {((job.vacancies_total ?? 0) - (job.vacancies_filled ?? 0))} remaining</p>
            <div className="prose max-w-none">
              <p>{(typeof job.description === 'string') ? job.description : (job.description?.en ?? Object.values(job.description || {})[0] ?? '')}</p>
            </div>

            <div className="mt-8">
              {((job.vacancies_total ?? 0) - (job.vacancies_filled ?? 0)) <= 0 ? (
                <Button disabled className="opacity-60">No Vacancies</Button>
              ) : (
                <Button onClick={() => router.push(`/Jobs/${job.id}/apply`)}>Apply</Button>
              )}
            </div>
          </article>
        )}
      </div>

      <Footer />
    </main>
  )
}
