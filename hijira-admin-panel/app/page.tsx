'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            HIJRA Admin Panel
          </p>
          <h1 className="mt-6 text-5xl font-bold text-foreground">Operations and Approval Portal</h1>
          <p className="mt-5 text-lg text-foreground/70">
            Dedicated workspace for Super Admin and Staff to manage onboarding approvals, staffing, and recruitment controls.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/Login">
              <Button className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
                Login to Admin
              </Button>
            </Link>
            <Link href="/Dashboard">
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-primary/20 hover:bg-primary/5">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {[
            { title: 'Partner Review', body: 'Approve or reject foreign agency registrations with license verification.' },
            { title: 'Staff Management', body: 'Super Admin can create Staff accounts securely.' },
            { title: 'Phase One Monitoring', body: 'Track pending onboarding tasks and role-based account activity.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-foreground/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
