 'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Profile, downloadFile, Documents, getAccessToken } from '@/lib/api'

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('Passport Copy')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const token = getAccessToken()
        if (!token) {
          if (mounted) setError('Please log in to view and upload documents')
          return
        }

        const profile = await Profile.get()
        const list = Array.isArray(profile.documents) ? profile.documents : (profile.documents?.data ?? [])
        if (mounted) setDocs(list)
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Failed to load documents')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

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
      alert(err?.message ?? 'Download failed')
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">My Documents</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Upload Document</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <label className="flex flex-col">
                <span className="text-sm mb-1">Document Type</span>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-3 py-2 border rounded">
                  <option value="Passport Copy">Passport Copy</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Training Documents">Training Documents</option>
                  <option value="Profile Photo">Profile Photo</option>
                </select>
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="text-sm mb-1">File</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <Button onClick={async () => {
                if (!file) return alert('Please choose a file')
                const allowed = ['application/pdf', 'image/jpeg', 'image/png']
                if (!allowed.includes(file.type)) {
                  setError('Allowed formats are PDF, JPG, PNG only')
                  return
                }
                const fd = new FormData()
                fd.append('file', file)
                fd.append('document_type', docType)
                setUploading(true)
                setError(null)
                try {
                  await Documents.upload(fd)
                  // reload documents
                  const profile = await Profile.get()
                  const list = Array.isArray(profile.documents) ? profile.documents : (profile.documents?.data ?? [])
                  setDocs(list)
                  setFile(null)
                  setDocType('Passport Copy')
                } catch (err: any) {
                  setError(err?.message ?? 'Upload failed')
                } finally {
                  setUploading(false)
                }
              }} disabled={uploading} className="bg-primary text-white">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </div>

          <div className="space-y-3">
            {docs.map((d: any) => (
              <div key={d.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{d.document_type ?? d.name}</p>
                  <p className="text-xs text-foreground/60">Status: {d.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(d.id)} className="text-sm">Download</Button>
                </div>
              </div>
            ))}
            {docs.length === 0 && !loading && <p className="text-foreground/60">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default DocumentsPage
