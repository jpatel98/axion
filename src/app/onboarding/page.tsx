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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Axion</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Let's get you set up with your manufacturing workspace
          </p>
        </div>

        {/* Choose Mode */}
        {mode === 'choose' && (
          <div className="space-y-6">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:-translate-y-1" onClick={() => setMode('join')}>
              <CardHeader className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">Join Existing Company</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      You have a company code from your manager or team lead
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:-translate-y-1" onClick={() => setMode('create')}>
              <CardHeader className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">Create New Company</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Start fresh with a new manufacturing workspace
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Join Company */}
        {mode === 'join' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Join Your Team</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter the company code provided by your manager
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleJoinCompany} className="space-y-6">
                <div>
                  <Label htmlFor="companyCode" className="text-sm font-medium text-gray-700">
                    Company Code
                  </Label>
                  <Input
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="Enter company code (e.g., ACME123)"
                    className="mt-2 h-12 text-center font-mono text-lg tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    This code was shared with you by your team manager
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setMode('choose')}
                    disabled={loading}
                    className="flex-1 h-12"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !companyCode.trim()}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  >
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
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4 mx-auto">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Create Your Company</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Set up a new manufacturing workspace for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleCreateCompany} className="space-y-6">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="mt-2 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    You'll be set up as the manager with full access
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setMode('choose')}
                    disabled={loading}
                    className="flex-1 h-12"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !companyName.trim()}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  >
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