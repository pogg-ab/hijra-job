'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Auth, saveAuth, API_BASE_URL } from '@/lib/api'

const RegisterMultiStep: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2
    phone: '',
    dateOfBirth: '',
    gender: '',
    preferredLanguage: 'en',
    // Step 3 (profile)
    educationLevel: '',
    experienceSummary: '',
    skills: '', // comma-separated
    // Step 4
    agreeTerms: false,
    agreePrivacy: false,
  })
 

  const steps = [
    { num: 1, title: 'Personal Info', desc: 'Basic information' },
    { num: 2, title: 'Contact Details', desc: 'How we reach you' },
    { num: 3, title: 'Profile', desc: 'Education and skills' },
    { num: 4, title: 'Agreement', desc: 'Terms & conditions' }
  ]

  const languages = ['en', 'am', 'ar', 'or']
  const educationLevels = [
    'Primary',
    'Secondary',
    'Diploma',
    'Bachelor',
    'Master',
    'Other'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({
        ...formData,
        [name]: checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleLanguageToggle = (lang: string) => {
    // keep for future, not used now
  }

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && 
                       formData.password && formData.password === formData.confirmPassword

  const isStep2Valid = formData.phone && formData.dateOfBirth && formData.gender

  const isStep3Valid = formData.educationLevel && formData.experienceSummary

  

  

  // Policies fetched for step 4 display (full objects)
  const [termsPolicy, setTermsPolicy] = useState<any | null>(null)
  const [privacyPolicy, setPrivacyPolicy] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'terms'|'privacy'|null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL ?? 'http://127.0.0.1:8000'
        const resTerms = await (await fetch(`${base}/api/policies/terms`)).json()
        const resPrivacy = await (await fetch(`${base}/api/policies/privacy`)).json()
        if (!mounted) return
        setTermsPolicy(resTerms?.data ?? null)
        setPrivacyPolicy(resPrivacy?.data ?? null)
      } catch {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  // Determine which agreements are required based on available policies
  const requiredTerms = Boolean(termsPolicy)
  const requiredPrivacy = Boolean(privacyPolicy)

  const isStep4Valid = (requiredTerms ? formData.agreeTerms : true) && (requiredPrivacy ? formData.agreePrivacy : true)

  const canProceed = 
    (currentStep === 1 && isStep1Valid) ||
    (currentStep === 2 && isStep2Valid) ||
    (currentStep === 3 && isStep3Valid) ||
    (currentStep === 4 && isStep4Valid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (currentStep === 4 && isStep4Valid) {
      setIsSubmitting(true)

      try {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          phone: formData.phone,
          preferred_language: formData.preferredLanguage || 'en',
          profile: {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            gender: formData.gender || null,
            date_of_birth: formData.dateOfBirth || null,
            education_level: formData.educationLevel || null,
            experience_summary: formData.experienceSummary || null,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          },
        }

        const response = await Auth.register(payload)

        const accessToken = response.auth?.access_token ?? response.token
        if (accessToken) {
          saveAuth({
            access_token: accessToken,
            token_type: response.auth?.token_type ?? 'bearer',
            expires_in: response.auth?.expires_in,
          })
        }

        window.location.href = '/Dashboard'
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Registration failed')
      } finally {
        setIsSubmitting(false)
      }
    } else if (canProceed) {
      setCurrentStep(currentStep + 1)
    }
  }

  function markdownToHtml(md: string | null) {
    if (!md) return ''
    // very small markdown -> html converter for headings and links and paragraphs
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    // headings
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    // paragraphs
    html = html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
    return html
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join Hijra Today</h1>
          <p className="text-lg text-foreground/60">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title ?? ''}</p>
 
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    step.num < currentStep
                      ? 'bg-green-500 text-white'
                      : step.num === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-border text-foreground/60'
                  }`}
                >
                  {step.num < currentStep ? '✓' : step.num}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      step.num < currentStep ? 'bg-green-500' : 'bg-border'
                    }`}
                  ></div>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-foreground">{step.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 shadow-sm mb-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{steps[0].title}</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{steps[1].title}</h2>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 9 XX XXX XXXX"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-foreground mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-foreground mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-semibold text-foreground mb-2">Preferred language</label>
                <select id="preferredLanguage" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none">
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="ar">Arabic</option>
                  <option value="or">Oromo</option>
                </select>
              </div>

              {/* partner fields removed — partner registration uses separate page */}
            </div>
          )}

          {/* Step 3: Professional Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{steps[2].title}</h2>

              <div>
                <label htmlFor="educationLevel" className="block text-sm font-semibold text-foreground mb-2">Education level</label>
                <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none">
                  <option value="">Select education level</option>
                  {educationLevels.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="experienceSummary" className="block text-sm font-semibold text-foreground mb-2">Experience summary</label>
                <textarea id="experienceSummary" name="experienceSummary" value={formData.experienceSummary} onChange={handleChange} placeholder="Briefly describe your work experience..." rows={4} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none resize-none" />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-semibold text-foreground mb-2">Skills (comma separated)</label>
                <input id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. housekeeping, customer service" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none" />
              </div>
            </div>
          )}

          {/* Step 4: Agreement */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{steps[3].title}</h2>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                {requiredTerms && (
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="w-5 h-5 border border-border rounded bg-background text-primary cursor-pointer focus:ring-2 focus:ring-primary mt-0.5"
                    />
                    <label htmlFor="agreeTerms" className="cursor-pointer">
                      <p className="font-semibold text-foreground">I agree to the Terms of Service</p>
                      <p className="text-sm text-foreground/60 mt-1">
                        I understand and accept all terms and conditions of the Hijra platform.{' '}
                        {termsPolicy && (
                          <button type="button" onClick={() => { setModalType('terms'); setModalOpen(true) }} className="text-primary underline ml-1">Read</button>
                        )}
                      </p>
                    </label>
                  </div>
                )}

                {requiredPrivacy && (
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="agreePrivacy"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleChange}
                      className="w-5 h-5 border border-border rounded bg-background text-primary cursor-pointer focus:ring-2 focus:ring-primary mt-0.5"
                    />
                    <label htmlFor="agreePrivacy" className="cursor-pointer">
                      <p className="font-semibold text-foreground">I agree to the Privacy Policy</p>
                      <p className="text-sm text-foreground/60 mt-1">
                        I consent to the collection and use of my data as described in the Privacy Policy.{' '}
                        {privacyPolicy && (
                          <button type="button" onClick={() => { setModalType('privacy'); setModalOpen(true) }} className="text-primary underline ml-1">Read</button>
                        )}
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Your account will be created and you'll be taken to the dashboard to complete your profile.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-border">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-primary/20 text-primary hover:bg-primary/5"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : currentStep === 4 ? 'Create Account' : 'Continue'}
            </Button>
          </div>
        </form>

        {/* Policy Modal */}
        {modalOpen && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
            <div className="relative max-w-3xl w-full mx-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 overflow-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{modalType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-foreground/60">Close</button>
              </div>
                      <div className="prose max-w-none text-foreground">
                        {modalType === 'terms' && termsPolicy?.file_path ? (
                          <iframe src={`${API_BASE_URL}/api/policies/${termsPolicy.id}/download`} className="w-full h-[70vh] border" />
                        ) : modalType === 'privacy' && privacyPolicy?.file_path ? (
                          <iframe src={`${API_BASE_URL}/api/policies/${privacyPolicy.id}/download`} className="w-full h-[70vh] border" />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(modalType === 'terms' ? termsPolicy?.content ?? null : privacyPolicy?.content ?? null) }} />
                        )}
                      </div>
            </div>
          </div>
        )}

        {/* Login Link */}
        <div className="text-center">
          <p className="text-foreground/60">
            Already have an account?{' '}
            <Link href="/Login" className="text-primary hover:text-primary/80 font-semibold transition">
              Log in here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default RegisterMultiStep
