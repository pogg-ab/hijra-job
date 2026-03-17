'use client'

import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

const DashboardPage: React.FC = () => {
  const stats = [
    {
      label: 'Active Applications',
      value: '3',
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      label: 'Verified Documents',
      value: '2 of 5',
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      label: 'Messages',
      value: '1',
      icon: '💬',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      label: 'Profile Completeness',
      value: '85%',
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ]

  const applications = [
    {
      id: 1,
      title: 'Housekeeping Manager',
      company: 'Premium Hotel Group',
      country: 'Germany',
      status: 'Pending',
      statusColor: 'badge-pending',
      appliedDate: 'Mar 10, 2025',
      lastUpdate: '2 days ago'
    },
    {
      id: 2,
      title: 'Home Nurse',
      company: 'Al-Noor Healthcare',
      country: 'Saudi Arabia',
      status: 'Interview',
      statusColor: 'badge-interview',
      appliedDate: 'Mar 5, 2025',
      lastUpdate: '1 day ago'
    },
    {
      id: 3,
      title: 'Care Worker',
      company: 'Nordic Care Services',
      country: 'Norway',
      status: 'Pending',
      statusColor: 'badge-pending',
      appliedDate: 'Mar 1, 2025',
      lastUpdate: '5 days ago'
    }
  ]

  const documents = [
    { name: 'Passport', status: 'Verified', icon: '🛂' },
    { name: 'CV', status: 'Verified', icon: '📄' },
    { name: 'Degree Certificate', status: 'Pending', icon: '🎓' },
    { name: 'Work Experience Letter', status: 'Not Uploaded', icon: '📋' },
    { name: 'Health Certificate', status: 'Not Uploaded', icon: '⚕️' },
  ]

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome back, Abeba</h1>
            <Link href="#settings">
              <Button variant="outline" className="border-primary/20 text-foreground hover:bg-primary/5">
                ⚙️ Settings
              </Button>
            </Link>
          </div>
          <p className="text-foreground/60">Here's an overview of your job search progress</p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} border border-border rounded-lg p-6 hover:shadow-md transition`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="text-sm text-foreground/60 mb-1">{stat.label}</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">My Applications</h2>
              <Link href="/Jobs">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  + Browse More Jobs
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{app.title}</h3>
                      <p className="text-foreground/60 text-sm">{app.company} • {app.country}</p>
                    </div>
                    <span className={`${app.statusColor} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border/50">
                    <div className="text-xs text-foreground/60 mb-3 sm:mb-0">
                      <p>Applied: <span className="font-medium">{app.appliedDate}</span></p>
                      <p>Last update: <span className="font-medium">{app.lastUpdate}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-sm border-primary/20 hover:bg-primary/5">
                        View Details
                      </Button>
                      <Button variant="outline" className="text-sm border-primary/20 hover:bg-primary/5">
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Quick Actions */}
          <div className="space-y-8">
            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Documents</h3>
              </div>
              
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{doc.icon}</span>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{doc.name}</p>
                          <p className="text-xs text-foreground/60">
                            {doc.status === 'Verified' ? '✓ ' : ''}
                            {doc.status}
                          </p>
                        </div>
                      </div>
                      {doc.status === 'Not Uploaded' && (
                        <Button variant="ghost" className="text-primary text-xs hover:bg-primary/10">
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Manage All Documents
              </Button>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link href="/Jobs">
                  <Button variant="outline" className="w-full justify-start text-foreground border-border hover:bg-primary/5 hover:border-primary/20">
                    <span className="mr-3">🔍</span> Search New Jobs
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start text-foreground border-border hover:bg-primary/5 hover:border-primary/20">
                  <span className="mr-3">📝</span> Update Profile
                </Button>
                <Button variant="outline" className="w-full justify-start text-foreground border-border hover:bg-primary/5 hover:border-primary/20">
                  <span className="mr-3">❤️</span> View Saved Jobs
                </Button>
                <Button variant="outline" className="w-full justify-start text-foreground border-border hover:bg-primary/5 hover:border-primary/20">
                  <span className="mr-3">📞</span> Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default DashboardPage
