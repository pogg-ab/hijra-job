'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Auth } from '@/lib/api'

export default function RegisterPartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    country: '',
  })
  const [licenseFile, setLicenseFile] = useState<File | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!licenseFile) {
      setError('Please upload a company license file.')
      return
    }

    setIsSubmitting(true)
    try {
      const body = new FormData()
      Object.entries(formData).forEach(([key, value]) => body.append(key, value))
      body.append('license_file', licenseFile)

      await Auth.registerPartner(body)

      setSuccess('Registration submitted. Your agency is pending super admin approval.')
      // show success then redirect to Login so user can sign in once approved
      setTimeout(() => router.push('/Login'), 1400)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        company_email: '',
        company_phone: '',
        country: '',
      })
      setLicenseFile(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Partner registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Foreign Agency Registration</h1>
          <p className="text-foreground/60">Register your company and upload license for approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 shadow-sm space-y-5">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

          <div className="grid md:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Contact person name" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Contact person email" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+2519XXXXXXXX" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company name" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" name="company_email" value={formData.company_email} onChange={handleChange} placeholder="Company email" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input name="company_phone" value={formData.company_phone} onChange={handleChange} placeholder="Company phone" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setLicenseFile(event.target.files?.[0] ?? null)} required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="Confirm password" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>

          <p className="text-center text-sm text-foreground/60">
            Already have an account? <Link href="/Login" className="text-primary font-semibold">Login</Link>
          </p>
        </form>
      </div>

      <Footer />
    </main>
  )
}
