'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { showAlert } from '@/lib/popup'

type AboutSection = {
  id: number
  key: string
  title: string | null
  description: string | null
  content: Record<string, any> | null
  order: number
  is_active: boolean
}

const requiredSectionKeys = [
  'company_background',
  'mission',
  'vision',
  'legal_compliance',
  'recruitment_standards',
  'certifications',
]

function prettyLabel(key: string) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export default function AboutAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sections, setSections] = useState<AboutSection[]>([])

  const sectionsMap = useMemo(() => {
    const map = new Map<string, AboutSection>()
    sections.forEach((s) => map.set(s.key, s))
    return map
  }, [sections])

  async function loadSections() {
    setLoading(true)
    setError('')
    try {
      const res = await AdminApi.aboutPageSections()
      const list = Array.isArray(res) ? res : (res.data ?? [])
      setSections(list)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load about page content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSections()
  }, [])

  async function saveSection(key: string, payload: {
    title: string
    description: string
    content: Record<string, any>
    order: number
    is_active: boolean
  }) {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await AdminApi.updateAboutPageSection(key, payload)
      setNotice(`${prettyLabel(key)} updated.`)
      await loadSections()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update section')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground">About Page Content Management</h1>
          <p className="mt-2 text-foreground/70">Manage company background, mission, vision, compliance, standards, and certifications.</p>
        </header>

        {loading && <p className="text-foreground/70">Loading...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

        {!loading && (
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">Sections</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {requiredSectionKeys.map((key) => {
                const item = sectionsMap.get(key)
                const contentText = item?.content ? JSON.stringify(item.content, null, 2) : '{}'

                return (
                  <div key={key} className="rounded-lg border border-border p-4">
                    <h3 className="font-semibold text-foreground">{prettyLabel(key)}</h3>

                    <SectionEditor
                      defaultTitle={item?.title ?? ''}
                      defaultDescription={item?.description ?? ''}
                      defaultContentText={contentText}
                      defaultOrder={item?.order ?? 0}
                      defaultIsActive={item?.is_active ?? true}
                      disabled={saving}
                      onSave={(value) => saveSection(key, value)}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

type SectionEditorProps = {
  defaultTitle: string
  defaultDescription: string
  defaultContentText: string
  defaultOrder: number
  defaultIsActive: boolean
  disabled: boolean
  onSave: (payload: {
    title: string
    description: string
    content: Record<string, any>
    order: number
    is_active: boolean
  }) => Promise<void>
}

function SectionEditor(props: SectionEditorProps) {
  const [title, setTitle] = useState(props.defaultTitle)
  const [description, setDescription] = useState(props.defaultDescription)
  const [contentText, setContentText] = useState(props.defaultContentText)
  const [order, setOrder] = useState(props.defaultOrder)
  const [isActive, setIsActive] = useState(props.defaultIsActive)

  useEffect(() => {
    setTitle(props.defaultTitle)
    setDescription(props.defaultDescription)
    setContentText(props.defaultContentText)
    setOrder(props.defaultOrder)
    setIsActive(props.defaultIsActive)
  }, [props.defaultTitle, props.defaultDescription, props.defaultContentText, props.defaultOrder, props.defaultIsActive])

  return (
    <div className="mt-3 space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full rounded-md border border-border bg-background px-3 py-2 min-h-20"
      />
      <textarea
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        placeholder="Content JSON"
        className="w-full rounded-md border border-border bg-background px-3 py-2 min-h-28 font-mono text-sm"
      />
      <input
        value={order}
        onChange={(e) => setOrder(Number(e.target.value || 0))}
        type="number"
        placeholder="Order"
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
      <label className="inline-flex items-center gap-2 text-sm text-foreground/80">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>
      <div>
        <Button
          disabled={props.disabled}
          onClick={async () => {
            let parsed: Record<string, any> = {}
            try {
              parsed = contentText.trim() ? JSON.parse(contentText) : {}
            } catch {
              await showAlert('Content JSON is invalid', 'Validation')
              return
            }
            await props.onSave({
              title,
              description,
              content: parsed,
              order,
              is_active: isActive,
            })
          }}
          className="bg-primary text-primary-foreground"
        >
          Save Section
        </Button>
      </div>
    </div>
  )
}
