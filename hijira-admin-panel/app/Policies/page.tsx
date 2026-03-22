'use client'

import React, { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import { AdminApi, API_BASE_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PoliciesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [policyForm, setPolicyForm] = useState({ title: '', type: 'terms', content: '', file: null as File | null })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await AdminApi.policies()
        const list = Array.isArray(res) ? res : (res.data ?? [])
        if (mounted) setItems(list)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-background">

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Manage Policies</h1>

        <section className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Create Policy (Quick)</h2>
          <form onSubmit={async (e) => {
            e.preventDefault()
            try {
              if (policyForm.file) {
                const fd = new FormData()
                fd.append('title', policyForm.title)
                fd.append('type', policyForm.type)
                fd.append('content', policyForm.content)
                fd.append('file', policyForm.file)
                await AdminApi.createPolicyForm(fd)
              } else {
                await AdminApi.createPolicy({ title: policyForm.title, type: policyForm.type, content: policyForm.content })
              }
              window.location.reload()
            } catch (err) {
              console.error(err)
              alert('Failed to create policy')
            }
          }} className="space-y-3">
            <input required value={policyForm.title} onChange={(e) => setPolicyForm((s) => ({ ...s, title: e.target.value }))} placeholder="Policy title" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <select value={policyForm.type} onChange={(e) => setPolicyForm((s) => ({ ...s, type: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary">
              <option value="terms">Terms of Service</option>
              <option value="privacy">Privacy Policy</option>
            </select>
            <textarea value={policyForm.content} onChange={(e) => setPolicyForm((s) => ({ ...s, content: e.target.value }))} placeholder="Optional: short summary (will be ignored if PDF uploaded)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary h-28" />
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Upload PDF (optional)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setPolicyForm((s) => ({ ...s, file: e.target.files && e.target.files[0] ? e.target.files[0] : null }))} className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary text-primary-foreground">Create Policy</Button>
              <Link href="/Policies"><Button variant="outline">Refresh</Button></Link>
            </div>
          </form>
        </section>

        <div>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="p-4 border rounded flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold">{p.title} <span className="text-sm text-foreground/60">({p.type})</span></div>
                    <div className="text-sm text-foreground/60 mt-2">{p.content ? p.content.slice(0, 200) : ''}</div>
                    {p.file_path && (
                      <div className="mt-2">
                        <a href={`${API_BASE_URL}/api/policies/${p.id}/download`} target="_blank" rel="noreferrer" className="text-primary underline">Download PDF</a>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button onClick={async () => {
                      const newTitle = prompt('Title', p.title)
                      if (!newTitle) return
                      try {
                        await AdminApi.updatePolicy(p.id, { title: newTitle })
                        window.location.reload()
                      } catch (e) { console.error(e) }
                    }} variant="outline">Edit</Button>
                    <Button onClick={async () => {
                      if (!confirm('Delete?')) return
                      try {
                        await AdminApi.deletePolicy(p.id)
                        window.location.reload()
                      } catch (e) { console.error(e) }
                    }} className="bg-red-600 text-white">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
