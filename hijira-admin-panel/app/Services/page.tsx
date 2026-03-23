'use client'

import React, { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import { AdminApi } from '@/lib/api'
import { showAlert, showConfirm } from '@/lib/popup'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function linesToArray(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function arrayToLines(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.filter((entry): entry is string => typeof entry === 'string').join('\n')
}

export default function ServicesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirementsText, setRequirementsText] = useState('')
  const [countriesText, setCountriesText] = useState('')
  const [instructionsText, setInstructionsText] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    id: null,
    title: '',
    slug: '',
    description: '',
    icon: '',
    order: 0,
    is_active: true,
    requirementsText: '',
    countriesText: '',
    instructionsText: '',
  })

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const res = await AdminApi.services()
      const list = Array.isArray(res) ? res : (res.data ?? [])
      setItems(list)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function handleCreate() {
    if (!title) {
      await showAlert('Enter title', 'Validation')
      return
    }

    try {
      await AdminApi.createService({
        title,
        description,
        qualification_requirements: linesToArray(requirementsText),
        target_countries: linesToArray(countriesText),
        application_instructions: linesToArray(instructionsText),
      })
      setTitle('')
      setDescription('')
      setRequirementsText('')
      setCountriesText('')
      setInstructionsText('')
      await loadItems()
    } catch (e: any) {
      await showAlert(e?.message ?? 'Failed', 'Error')
    }
  }

  function openEditDialog(service: any) {
    setEditForm({
      id: service.id,
      title: service.title ?? '',
      slug: service.slug ?? '',
      description: service.description ?? '',
      icon: service.icon ?? '',
      order: Number(service.order ?? 0),
      is_active: Boolean(service.is_active ?? true),
      requirementsText: arrayToLines(service.qualification_requirements),
      countriesText: arrayToLines(service.target_countries),
      instructionsText: arrayToLines(service.application_instructions),
    })
    setEditOpen(true)
  }

  async function saveEdit() {
    if (!editForm.title?.trim()) {
      await showAlert('Title is required', 'Validation')
      return
    }

    try {
      await AdminApi.updateService(editForm.id, {
        title: editForm.title,
        slug: editForm.slug || null,
        description: editForm.description,
        icon: editForm.icon || null,
        order: Number(editForm.order || 0),
        is_active: Boolean(editForm.is_active),
        qualification_requirements: linesToArray(editForm.requirementsText),
        target_countries: linesToArray(editForm.countriesText),
        application_instructions: linesToArray(editForm.instructionsText),
      })
      setEditOpen(false)
      await loadItems()
    } catch (e: any) {
      await showAlert(e?.message ?? 'Failed to update service', 'Error')
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Manage Services</h1>

        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="px-3 py-2 border rounded" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 border rounded" />
          <textarea
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
            placeholder="Qualification requirements (one per line)"
            className="px-3 py-2 border rounded min-h-24"
          />
          <textarea
            value={countriesText}
            onChange={(e) => setCountriesText(e.target.value)}
            placeholder="Target countries (one per line)"
            className="px-3 py-2 border rounded min-h-24"
          />
          <textarea
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            placeholder="Application instructions (one per line)"
            className="px-3 py-2 border rounded min-h-24 md:col-span-2"
          />
        </div>
        <div className="mb-8">
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground">Create Service</Button>
        </div>

        <div>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="space-y-3">
              {items.map((s) => (
                <div key={s.id} className="p-4 border rounded">
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-foreground/60">{s.description}</div>
                    <div className="mt-2 text-xs text-foreground/70">
                      Requirements: {Array.isArray(s.qualification_requirements) ? s.qualification_requirements.length : 0} |
                      Countries: {Array.isArray(s.target_countries) ? s.target_countries.length : 0} |
                      Instructions: {Array.isArray(s.application_instructions) ? s.application_instructions.length : 0}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => openEditDialog(s)} variant="outline">Edit</Button>
                    <Button onClick={async () => {
                      if (!await showConfirm('Delete this service?', 'Confirm Delete')) return
                      try {
                        await AdminApi.deleteService(s.id)
                        await loadItems()
                      } catch (e) { console.error(e) }
                    }} className="bg-red-600 text-white">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update all service fields, then save changes.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={editForm.title}
              onChange={(e) => setEditForm((p: any) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="px-3 py-2 border rounded"
            />
            <input
              value={editForm.slug}
              onChange={(e) => setEditForm((p: any) => ({ ...p, slug: e.target.value }))}
              placeholder="Slug (optional)"
              className="px-3 py-2 border rounded"
            />
            <input
              value={editForm.icon}
              onChange={(e) => setEditForm((p: any) => ({ ...p, icon: e.target.value }))}
              placeholder="Icon (optional)"
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              value={editForm.order}
              onChange={(e) => setEditForm((p: any) => ({ ...p, order: Number(e.target.value || 0) }))}
              placeholder="Order"
              className="px-3 py-2 border rounded"
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              className="px-3 py-2 border rounded min-h-20 md:col-span-2"
            />
            <textarea
              value={editForm.requirementsText}
              onChange={(e) => setEditForm((p: any) => ({ ...p, requirementsText: e.target.value }))}
              placeholder="Qualification requirements (one per line)"
              className="px-3 py-2 border rounded min-h-24"
            />
            <textarea
              value={editForm.countriesText}
              onChange={(e) => setEditForm((p: any) => ({ ...p, countriesText: e.target.value }))}
              placeholder="Target countries (one per line)"
              className="px-3 py-2 border rounded min-h-24"
            />
            <textarea
              value={editForm.instructionsText}
              onChange={(e) => setEditForm((p: any) => ({ ...p, instructionsText: e.target.value }))}
              placeholder="Application instructions (one per line)"
              className="px-3 py-2 border rounded min-h-24 md:col-span-2"
            />
            <label className="inline-flex items-center gap-2 text-sm text-foreground/80 md:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(editForm.is_active)}
                onChange={(e) => setEditForm((p: any) => ({ ...p, is_active: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-primary text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
