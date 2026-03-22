'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Profile as ProfileApi, Documents, downloadFile, API_BASE_URL } from '@/lib/api'

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('Passport')
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
    return () => { mounted = false }
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload: any = {
        name: profile.name,
        phone: profile.phone,
        preferred_language: profile.preferred_language,
        profile: {
          full_name: profile.profile?.full_name,
          gender: profile.profile?.gender,
          date_of_birth: profile.profile?.date_of_birth,
          education_level: profile.profile?.education_level,
          experience_summary: profile.profile?.experience_summary,
        }
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
    if (!file) return setError('Please choose a file')
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
      setDocType('Passport')
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return
    try {
      await Documents.destroy(id)
      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    }
  }

  const handleUpdateType = async (id: number, type: string) => {
    try {
      await Documents.update(id, { document_type: type })
      const refreshed = await ProfileApi.get()
      setProfile(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Update failed')
    }
  }

  const handleDownload = async (id: number) => {
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

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {profile && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col">
                  <span className="text-sm mb-1">Name</span>
                  <input value={profile.name ?? ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="px-3 py-2 border rounded" />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm mb-1">Phone</span>
                  <input value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="px-3 py-2 border rounded" />
                </label>
                <label className="flex flex-col md:col-span-2">
                  <span className="text-sm mb-1">Preferred language</span>
                  <select value={profile.preferred_language ?? 'en'} onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })} className="px-3 py-2 border rounded">
                    <option value="en">EN</option>
                    <option value="am">AM</option>
                    <option value="ar">AR</option>
                    <option value="or">OR</option>
                  </select>
                </label>

                <label className="flex flex-col md:col-span-2">
                  <span className="text-sm mb-1">Full name</span>
                  <input value={profile.profile?.full_name ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, full_name: e.target.value } })} className="px-3 py-2 border rounded" />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm mb-1">Gender</span>
                  <input value={profile.profile?.gender ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, gender: e.target.value } })} className="px-3 py-2 border rounded" />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm mb-1">Date of birth</span>
                  <input type="date" value={profile.profile?.date_of_birth ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, date_of_birth: e.target.value } })} className="px-3 py-2 border rounded" />
                </label>

                <label className="flex flex-col md:col-span-2">
                  <span className="text-sm mb-1">Experience summary</span>
                  <textarea value={profile.profile?.experience_summary ?? ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, experience_summary: e.target.value } })} className="px-3 py-2 border rounded" />
                </label>

              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={handleSave} className="bg-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <label className="flex flex-col">
                  <span className="text-sm mb-1">Document Type</span>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-3 py-2 border rounded">
                    <option value="Passport">Passport</option>
                    <option value="ID">ID</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </label>
                <label className="flex flex-col md:col-span-2">
                  <span className="text-sm mb-1">File</span>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="flex gap-2 mb-4">
                <Button onClick={handleUpload} className="bg-green-600" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Document'}</Button>
              </div>

              <div className="space-y-3">
                {(() => {
                  const list = Array.isArray(profile.documents) ? profile.documents : (Array.isArray(profile.documents?.data) ? profile.documents.data : [])
                  if (!list || list.length === 0) return <p className="text-foreground/60">No documents uploaded</p>

                  return list.map((d: any) => (
                    <div key={d.id} className="bg-background border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{d.document_type}</p>
                        <p className="text-xs text-foreground/60">Uploaded</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={d.document_type} onChange={(e) => handleUpdateType(d.id, e.target.value)} className="px-2 py-1 border rounded">
                          <option value="Passport">Passport</option>
                          <option value="ID">ID</option>
                          <option value="Certificate">Certificate</option>
                        </select>
                        <Button onClick={() => handleDownload(d.id)}>View</Button>
                        <Button onClick={() => handleDelete(d.id)} variant="outline">Delete</Button>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

export default ProfilePage
