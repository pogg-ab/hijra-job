'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const services = [
  {
    title: 'Job Seeker Registration',
    description:
      'Simple online registration for Ethiopian candidates with guided profile completion and job preferences.',
  },
  {
    title: 'Document Management',
    description:
      'Secure upload and tracking for passports, certificates, and IDs to support compliant international recruitment.',
  },
  {
    title: 'International Job Matching',
    description:
      'Curated opportunities across Europe, the Middle East, and Asia with transparent application updates.',
  },
  {
    title: 'Agency Compliance Support',
    description:
      'Showcase Level 1 agency credibility with clear, structured workflows for employers and seekers.',
  },
]

export default function ServicesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Services</h1>
          <p className="text-lg text-foreground/60 max-w-3xl">
            HIJRA FOREIGN EMPLOYMENT AGENCY PLC provides trusted recruitment services to connect Ethiopian talent with global employers.
          </p>
        </div>
      </section>

      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.title} className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-3">{service.title}</h2>
              <p className="text-foreground/70">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
