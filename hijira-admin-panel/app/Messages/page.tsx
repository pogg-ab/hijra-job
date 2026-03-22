'use client'

import React, { useEffect, useState } from 'react'
import { AdminApi, API_BASE_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function MessagesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<any | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  const load = async () => {
    setError(null)
    try {
      const res = await AdminApi.contacts()
      // admin endpoints return a paginated object or array
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
    <main className="min-h-screen flex flex-col bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (
              <div className="space-y-2">
                {items.map((c: any) => (
                  <div key={c.id} className={`p-3 border rounded cursor-pointer ${c.is_read ? 'bg-background' : 'bg-white'}`} onClick={async () => {
                    const detail = await AdminApi.getContact(c.id)
                    setSelected(detail)
                  }}>
                    <div className="font-semibold">{c.name} <span className="text-sm text-foreground/60">{c.email}</span></div>
                    <div className="text-sm text-foreground/60">{c.subject}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {!selected && (
              <div className="rounded-lg border border-border bg-card p-6">Select a message to view details.</div>
            )}

            {selected && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">{selected.name} <span className="text-sm text-foreground/60">{selected.email}</span></h2>
                <p className="text-sm text-foreground/70 mt-1">{selected.created_at}</p>
                <h3 className="mt-4 font-semibold">{selected.subject}</h3>
                <div className="mt-2 text-foreground/70 whitespace-pre-wrap">{selected.message}</div>

                {/* Replies thread */}
                <div className="mt-6 space-y-3">
                  {(selected.replies ?? []).map((r: any) => (
                    <div key={r.id} className="p-3 rounded border bg-background">
                      <div className="text-sm text-foreground/60">{r.sender} • {r.created_at}</div>
                      <div className="mt-1 whitespace-pre-wrap">{r.message}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {!selected.is_read && <Button onClick={async () => { await AdminApi.markContactRead(selected.id); await load(); const detail = await AdminApi.getContact(selected.id); setSelected(detail); }}>Mark Read</Button>}

                  <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Write a reply..." className="w-full px-3 py-2 border rounded" />
                  <div className="flex gap-2">
                    <Button disabled={!replyMessage.trim()} onClick={async () => {
                      try {
                        await AdminApi.replyContact(selected.id, { message: replyMessage });
                        await load();
                        const detail = await AdminApi.getContact(selected.id);
                        setSelected(detail);
                        setReplyMessage('');
                      } catch (err) {
                        alert('Failed to send reply')
                      }
                    }}>Reply</Button>
                    <Button variant="outline" onClick={() => setReplyMessage('')}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
