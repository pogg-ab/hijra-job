 'use client'

import React, { useEffect, useState } from 'react'
import { AdminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function FaqAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  const load = async () => {
    setError(null)
    try {
      const res = await AdminApi.faqs()
      const list = Array.isArray(res) ? res : (res.data ?? res)
      setItems(list)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">FAQs</h1>

        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-2">Create FAQ / Answer</h3>
          <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Question" className="w-full mb-2 p-2 border rounded" />
          <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Answer (optional)" className="w-full mb-2 p-2 border rounded" />
          <div className="flex gap-2">
            <Button onClick={async () => {
              try {
                await AdminApi.createFaq({ question: newQuestion, answer: newAnswer, is_public: !!newAnswer })
                setNewQuestion('')
                setNewAnswer('')
                await load()
              } catch (err) { alert('Failed') }
            }} disabled={!newQuestion.trim()}>Create</Button>
            <Button variant="outline" onClick={() => { setNewQuestion(''); setNewAnswer('') }}>Clear</Button>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="space-y-3">
          {items.map((f: any) => (
            <div key={f.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 font-semibold">{f.question}</div>
              <textarea defaultValue={f.answer ?? ''} onBlur={async (e) => {
                try {
                  await AdminApi.updateFaq(f.id, { question: f.question, answer: (e.target as HTMLTextAreaElement).value, is_public: !!(e.target as HTMLTextAreaElement).value })
                  await load()
                } catch (err) { alert('Update failed') }
              }} className="w-full p-2 border rounded mb-2" />
              <div className="flex gap-2">
                <Button onClick={async () => { if (!confirm('Delete this FAQ?')) return; await AdminApi.deleteFaq(f.id); await load() }} variant="outline">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
