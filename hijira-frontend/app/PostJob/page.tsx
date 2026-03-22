"use client"

import React, { useState } from "react"
import { Jobs } from "../../lib/api"
import { useRouter } from "next/navigation"

export default function PostJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [vacancies, setVacancies] = useState(1)
  const [salaryRange, setSalaryRange] = useState("")
  const [isHighLevel, setIsHighLevel] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        title: { en: title },
        description: { en: description },
        category,
        country,
        vacancies_total: Number(vacancies),
        salary_range: salaryRange || undefined,
        is_high_level: isHighLevel || undefined,
      }

      await Jobs.partnerCreate(payload)
      router.push("/Dashboard")
    } catch (err: any) {
      setError(err?.message || "Failed to submit job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background px-4 py-12">
      <div className="max-w-3xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-4">Post a Job (Partner)</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Job Title (EN)</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Description (EN)</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" rows={6} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Country</label>
              <input required value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Vacancies</label>
              <input required type="number" min={1} value={vacancies} onChange={(e) => setVacancies(Number(e.target.value))} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Salary Range</label>
              <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={isHighLevel} onChange={(e) => setIsHighLevel(e.target.checked)} className="mr-2" />
                High level
              </label>
            </div>
          </div>

          {error && <div className="text-destructive">{error}</div>}

          <div>
            <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md">
              {loading ? "Submitting..." : "Submit Job"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
