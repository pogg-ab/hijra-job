 'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Profile, Messages, Faqs } from '@/lib/api'

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'General'
  })
  const [user, setUser] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [myMessages, setMyMessages] = useState<any[] | null>(null)
  const [faqs, setFaqs] = useState<any[] | null>(null)
  const [askQuestion, setAskQuestion] = useState('')
  const [askName, setAskName] = useState('')
  const [askEmail, setAskEmail] = useState('')
  const [askSubmitting, setAskSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'
      const payload = {
        name: formData.name,
        email: user?.email ?? formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
      }

      const res = await fetch(`${base}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '', category: 'General' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error(err)
      alert('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const p = await Profile.get()
        if (!mounted) return
        // Profile.get returns user object when authenticated
        if (p && (p as any).email) {
          setUser(p)
          setFormData((prev) => ({ ...prev, name: p.name ?? prev.name, email: p.email ?? prev.email }))
          try {
            const msgs = await Messages.my()
            setMyMessages(msgs.data ?? msgs)
          } catch (e) {
            // ignore
          }
          try {
            const list = await Faqs.list()
            setFaqs(list.data ?? list)
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // not logged in or failed — ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'support@hijra.com'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our team in real-time',
      value: 'Available 9am - 5pm EAT'
    },
    {
      icon: '📞',
      title: 'Phone',
      description: 'Call our support team',
      value: '+251 1 234 5678'
    },
    {
      icon: '📍',
      title: 'Office',
      description: 'Visit us in person',
      value: 'Addis Ababa, Ethiopia'
    }
  ]

  const fallbackFaqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the Sign Up button and follow the multi-step registration process. You\'ll need a valid email and basic information.'
    },
    {
      question: 'What documents do I need to verify?',
      answer: 'You\'ll need to upload a passport, CV, and relevant certifications. Additional documents may be required for specific jobs.'
    },
    {
      question: 'How long does verification take?',
      answer: 'Document verification typically takes 24-48 hours. You\'ll receive notifications when each document is verified.'
    },
    {
      question: 'Can I apply for multiple jobs?',
      answer: 'Yes, you can apply for as many jobs as you\'d like. There\'s no limit on applications.'
    }
  ]

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Have questions? We're here to help. Contact our support team anytime.
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{method.title}</h3>
              <p className="text-sm text-foreground/60 mb-3">{method.description}</p>
              <p className="font-semibold text-primary">{method.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-foreground mb-8">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-semibold">✓ Message sent successfully!</p>
                <p className="text-sm text-green-700 dark:text-green-300">We'll get back to you as soon as possible.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                />
              </div>

              {/* Email Field (hidden when user is authenticated) */}
              {!user && (
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
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
              )}

              {/* Category & Subject */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  >
                    <option>General</option>
                    <option>Account</option>
                    <option>Application</option>
                    <option>Document Verification</option>
                    <option>Payment</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Message subject"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

            <div className="space-y-6">
                  {((faqs && faqs.length > 0) ? faqs : fallbackFaqs).map((faq, idx) => (
                    <div key={faq.id ?? idx} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition">
                      <h4 className="font-semibold text-foreground mb-2 text-sm">{faq.question}</h4>
                      <p className="text-foreground/60 text-sm leading-relaxed">{faq.answer ?? 'No answer yet'}</p>
                    </div>
                  ))}
            </div>

            {/* Help CTA */}
            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <p className="text-foreground/70 text-sm mb-4">Didn't find what you're looking for?</p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                View Full Help Center
              </Button>
            </div>

            {/* Ask a Question */}
            <div className="mt-6 rounded-lg border border-border bg-card p-4">
              <h4 className="font-semibold mb-2">Ask a question</h4>
              <textarea value={askQuestion} onChange={(e) => setAskQuestion(e.target.value)} placeholder="Type your question here" className="w-full p-2 border rounded mb-2" />
              {!user && (
                <>
                  <input value={askName} onChange={(e) => setAskName(e.target.value)} placeholder="Your name (optional)" className="w-full p-2 border rounded mb-2" />
                  <input value={askEmail} onChange={(e) => setAskEmail(e.target.value)} placeholder="Your email (optional)" className="w-full p-2 border rounded mb-2" />
                </>
              )}
              <div className="flex gap-2">
                <Button disabled={!askQuestion.trim() || askSubmitting} onClick={async () => {
                  setAskSubmitting(true)
                  try {
                    await Faqs.ask({ question: askQuestion, asker_name: user?.name ?? askName, asker_email: user?.email ?? askEmail })
                    setAskQuestion('')
                    setAskName('')
                    setAskEmail('')
                    // reload public faqs
                    const list = await Faqs.list()
                    setFaqs(list.data ?? list)
                    alert('Question submitted — admin will answer it.')
                  } catch (e) {
                    alert('Failed to submit question')
                  } finally { setAskSubmitting(false) }
                }}>{askSubmitting ? 'Sending...' : 'Ask Question'}</Button>
                <Button variant="outline" onClick={() => { setAskQuestion(''); setAskName(''); setAskEmail('') }}>Cancel</Button>
              </div>
            </div>

            {/* My Messages (for logged in users) */}
            {myMessages && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">My Messages</h3>
                <div className="space-y-3">
                  {myMessages.length === 0 && <div className="text-sm text-foreground/60">You have no messages yet.</div>}
                  {myMessages.map((m: any) => (
                    <div key={m.id} className="p-3 border rounded bg-card">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">{m.subject}</div>
                        <div className="text-sm text-foreground/60">{m.created_at}</div>
                      </div>
                      <div className="text-foreground/70 mt-2 whitespace-pre-wrap">{m.message}</div>
                      {(m.replies ?? []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(m.replies ?? []).map((r: any) => (
                            <div key={r.id} className="p-2 rounded border bg-background">
                              <div className="text-sm text-foreground/60">{r.sender} • {r.created_at}</div>
                              <div className="mt-1 whitespace-pre-wrap">{r.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default ContactPage
