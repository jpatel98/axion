'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Building2, 
  UserPlus, 
  ArrowRight, 
  Loader2,
  Users,
  Plus 
} from 'lucide-react'

export default function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'join' | 'create'>('choose')
  const [loading, setLoading] = useState(false)
  const [companyCode, setCompanyCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyCode.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/join-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyCode: companyCode.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || 'Failed to join company')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/create-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || 'Failed to create company')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Axion</h1>
          <p className="mt-2 text-gray-600">Let's get you set up with your manufacturing workspace</p>
        </div>

        {/* Choose Mode */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setMode('join')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <Users className="h-8 w-8 text-blue-600 mr-4" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Join Existing Company</CardTitle>
                  <CardDescription>
                    You have a company code from your manager or team lead
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setMode('create')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <Plus className="h-8 w-8 text-green-600 mr-4" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Create New Company</CardTitle>
                  <CardDescription>
                    Start fresh with a new manufacturing workspace
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Join Company */}
        {mode === 'join' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join Your Team
              </CardTitle>
              <CardDescription>
                Enter the company code provided by your manager
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCompany} className="space-y-4">
                <div>
                  <Label htmlFor="companyCode">Company Code</Label>
                  <Input
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="Enter company code (e.g., ACME123)"
                    className="mt-1 font-mono"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This code was shared with you by your team manager
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setMode('choose')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading || !companyCode.trim()}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Joining...</>
                    ) : (
                      <>Join Company</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Company */}
        {mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Your Company
              </CardTitle>
              <CardDescription>
                Set up a new manufacturing workspace for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You'll be set up as the manager with full access
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setMode('choose')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading || !companyName.trim()}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      <>Create Company</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}