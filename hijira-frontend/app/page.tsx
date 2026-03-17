'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const Home: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">Global Employment Opportunities</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect with <span className="text-primary">International Employers</span>
          </h1>
          
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your secure gateway to employment opportunities across Europe, the Middle East, and Asia. Build your professional profile, upload verified documents, and track applications in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/RegisterMultiStep">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/Jobs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 py-6 text-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose Hijra?</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">Secure, professional, and trusted by thousands of job seekers and employers worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure Profile Management',
                description: 'Create and manage your professional profile with verified credentials and document uploads.',
                icon: '🔒'
              },
              {
                title: 'Global Job Listings',
                description: 'Access thousands of verified job opportunities from employers across Europe, Middle East, and Asia.',
                icon: '🌍'
              },
              {
                title: 'Real-time Tracking',
                description: 'Monitor your applications, messages, and interview schedules all in one place.',
                icon: '📊'
              },
              {
                title: 'Document Verification',
                description: 'Securely upload and verify essential documents like passports, certifications, and references.',
                icon: '✅'
              },
              {
                title: 'Multi-language Support',
                description: 'Navigate in Amharic, Arabic, English, or Oromo for a personalized experience.',
                icon: '🗣️'
              },
              {
                title: 'Professional Support',
                description: 'Get guidance from our recruitment experts throughout your job search journey.',
                icon: '👥'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow duration-300 hover:border-primary/30">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Global Career?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of Ethiopian professionals working internationally. Create your profile today.</p>
          <Link href="/RegisterMultiStep">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-lg">
              Create Your Profile
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default Home
