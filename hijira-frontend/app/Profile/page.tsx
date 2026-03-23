'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Profile as ProfileApi, Documents, downloadFile } from '@/lib/api'
import { calculateProfileCompletion } from '@/lib/profileCompletion'

const inputClass = 'w-full rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1.5'

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('Passport Copy')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const p = await ProfileApi.get()
        if (mounted) setProfile(p)
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Failed to load profile')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setError(null)
    try {
      const payload: any = {
        name: profile.name,
        phone: profile.phone,
        preferred_language: profile.preferred_language,
        profile: {
          full_name: profile.profile?.full_name,
          gender: profile.profile?.gender,
          age: profile.profile?.age ? Number(profile.profile?.age) : null,
          passport_status: profile.profile?.passport_status,
          date_of_birth: profile.profile?.date_of_birth,
          nationality: profile.profile?.nationality,
          address: profile.profile?.address,
          education_level: profile.profile?.education_level,
          experience_summary: profile.profile?.experience_summary,
          preferred_country: profile.profile?.preferred_country,
          skills: profile.profile?.skills ?? [],
        },
      }

      await ProfileApi.update(payload)
      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a file')
      return
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      setError('Allowed formats are PDF, JPG, JPEG, PNG only')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('document_type', docType)
      await Documents.upload(fd)

      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
      setFile(null)
      setDocType('Passport Copy')
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return

    setError(null)
    try {
      await Documents.destroy(id)
      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    }
  }

  const handleUpdateType = async (id: number, type: string) => {
    setError(null)
    try {
      await Documents.update(id, { document_type: type })
      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Update failed')
    }
  }

  const handleDownload = async (id: number) => {
    setError(null)
    try {
      const { blob, disposition } = await downloadFile(`/api/documents/${id}/download`, true)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = disposition.split('filename=')[1]?.replace(/\"|\'/g, '') ?? `document-${id}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err?.message ?? 'Download failed')
    }
  }

  const documents = Array.isArray(profile?.documents)
    ? profile.documents
    : (Array.isArray(profile?.documents?.data) ? profile.documents.data : [])

  const completion = useMemo(() => calculateProfileCompletion(profile), [profile])
  const displayName = profile?.profile?.full_name || profile?.name || 'Profile'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => word[0]?.toUpperCase())
    .join('') || 'P'

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-40 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/30 to-background" />
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 py-10 md:py-14">
          {loading && <p className="text-foreground/70">Loading...</p>}
          {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</p>}

          {profile && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur p-6 md:p-8 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white grid place-items-center font-bold text-xl shadow-lg">
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">Profile Center</p>
                      <h1 className="text-3xl md:text-4xl font-black leading-tight text-foreground">{displayName}</h1>
                      <p className="text-sm text-foreground/65 mt-1">Complete your details to increase your hiring chances.</p>
                    </div>
                  </div>

                  <div className="min-w-52 rounded-2xl border border-border bg-background/70 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Completion</p>
                      <p className="text-2xl font-black text-emerald-600">{completion.percent}%</p>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300" style={{ width: `${completion.percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-foreground/60">{completion.completed} of {completion.total} items completed</p>
                  </div>
                </div>

                {(completion.missingFields.length > 0 || completion.missingDocuments.length > 0) && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                    <span className="font-semibold">Missing:</span>{' '}
                    {[...completion.missingFields, ...completion.missingDocuments].join(', ')}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Personal Information</h2>
                  <span className="text-xs rounded-full border border-border px-3 py-1 text-foreground/70">Main Profile</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/60 mb-3">Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col">
                        <span className={labelClass}>Name</span>
                        <input value={profile.name ?? ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Phone</span>
                        <input value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} />
                      </label>

                      <label className="flex flex-col md:col-span-2">
                        <span className={labelClass}>Preferred Language</span>
                        <select value={profile.preferred_language ?? 'en'} onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })} className={inputClass}>
                          <option value="en">EN</option>
                          <option value="am">AM</option>
                          <option value="ar">AR</option>
                          <option value="or">OR</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/60 mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col md:col-span-2">
                        <span className={labelClass}>Full Name</span>
                        <input value={profile.profile?.full_name ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, full_name: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Gender</span>
                        <input value={profile.profile?.gender ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, gender: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Date Of Birth</span>
                        <input type="date" value={profile.profile?.date_of_birth ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, date_of_birth: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Nationality</span>
                        <input value={profile.profile?.nationality ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, nationality: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col md:col-span-2">
                        <span className={labelClass}>Address</span>
                        <textarea value={profile.profile?.address ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, address: e.target.value } })} className={inputClass} rows={2} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Passport Status</span>
                        <select value={profile.profile?.passport_status ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, passport_status: e.target.value } })} className={inputClass}>
                          <option value="">Select status</option>
                          <option value="valid">Valid Passport</option>
                          <option value="expired">Expired Passport</option>
                          <option value="applied">Applied / In Process</option>
                          <option value="none">No Passport</option>
                        </select>
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Age</span>
                        <input type="number" min={18} max={65} value={profile.profile?.age ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, age: e.target.value } })} className={inputClass} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/60 mb-3">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col">
                        <span className={labelClass}>Education</span>
                        <input value={profile.profile?.education_level ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, education_level: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col">
                        <span className={labelClass}>Preferred Country</span>
                        <input value={profile.profile?.preferred_country ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, preferred_country: e.target.value } })} className={inputClass} />
                      </label>

                      <label className="flex flex-col md:col-span-2">
                        <span className={labelClass}>Work Experience</span>
                        <textarea value={profile.profile?.experience_summary ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, experience_summary: e.target.value } })} className={inputClass} rows={3} />
                      </label>

                      <label className="flex flex-col md:col-span-2">
                        <span className={labelClass}>Skills (Comma Separated)</span>
                        <input
                          value={Array.isArray(profile.profile?.skills) ? profile.profile.skills.join(', ') : ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            profile: {
                              ...profile.profile,
                              skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                            },
                          })}
                          className={inputClass}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSave} className="min-w-40 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </section>

              <section className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Documents</h2>
                    <p className="text-sm text-foreground/65 mt-1">Required: Passport copy, Certificates, Training documents, and Profile photo.</p>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60">Allowed: PDF, JPG, PNG</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <label className="flex flex-col">
                    <span className={labelClass}>Document Type</span>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputClass}>
                      <option value="Passport Copy">Passport Copy</option>
                      <option value="Certificates">Certificates</option>
                      <option value="Training Documents">Training Documents</option>
                      <option value="Profile Photo">Profile Photo</option>
                    </select>
                  </label>

                  <label className="flex flex-col md:col-span-2">
                    <span className={labelClass}>File</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inputClass} />
                  </label>
                </div>

                <div className="flex justify-end mb-6">
                  <Button onClick={handleUpload} className="bg-teal-600 hover:bg-teal-700 text-white" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {documents.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-foreground/60 text-center">
                      No documents uploaded yet.
                    </div>
                  )}

                  {documents.map((d: any) => (
                    <div key={d.id} className="rounded-2xl border border-border bg-background/80 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{d.document_type}</p>
                        <p className="text-xs text-foreground/60">Uploaded and ready for review</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select value={d.document_type} onChange={(e) => handleUpdateType(d.id, e.target.value)} className="rounded-lg border border-border/70 bg-background px-2.5 py-2 text-sm">
                          <option value="Passport Copy">Passport Copy</option>
                          <option value="Certificates">Certificates</option>
                          <option value="Training Documents">Training Documents</option>
                          <option value="Profile Photo">Profile Photo</option>
                        </select>
                        <Button onClick={() => handleDownload(d.id)} className="bg-primary hover:bg-primary/90">View</Button>
                        <Button onClick={() => handleDelete(d.id)} variant="outline">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default ProfilePage
