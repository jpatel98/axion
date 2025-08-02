'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugSyncPage() {
  const { user } = useUser()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
      })
      const data = await response.json()
      setResult({ type: 'sync', data, status: response.status })
    } catch (error) {
      setResult({ type: 'sync', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setSyncing(false)
    }
  }

  const handleForceSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/auth/force-sync', {
        method: 'POST',
      })
      const data = await response.json()
      setResult({ type: 'force-sync', data, status: response.status })
    } catch (error) {
      setResult({ type: 'force-sync', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setSyncing(false)
    }
  }

  const checkRole = async () => {
    try {
      const response = await fetch('/api/auth/user-role')
      const data = await response.json()
      setResult({ type: 'role-check', data, status: response.status })
    } catch (error) {
      setResult({ type: 'role-check', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug User Sync</CardTitle>
          <CardDescription>
            Debug and fix user synchronization issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current Clerk User:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify({
                id: user?.id,
                email: user?.emailAddresses[0]?.emailAddress,
                firstName: user?.firstName,
                lastName: user?.lastName
              }, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Regular Sync'}
            </Button>
            <Button onClick={handleForceSync} disabled={syncing} variant="outline">
              {syncing ? 'Syncing...' : 'Force Sync'}
            </Button>
            <Button onClick={checkRole} variant="outline">
              Check Role
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-2">Result ({result.type}):</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}