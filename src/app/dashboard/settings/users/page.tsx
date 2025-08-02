'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ManagerOnly } from '@/components/rbac/PermissionGate'
import { UserRole } from '@/lib/types/roles'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  ShieldCheck,
  Copy,
  AlertTriangle 
} from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  created_at: string
}

interface InviteData {
  email: string
  role: UserRole
  company_name?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteForm, setInviteForm] = useState<InviteData>({ email: '', role: UserRole.OPERATOR })
  const [inviting, setInviting] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<{ name: string; code: string } | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchCompanyInfo()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/auth/company-info')
      if (response.ok) {
        const data = await response.json()
        setCompanyInfo(data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)

    try {
      const response = await fetch('/api/auth/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      })

      if (response.ok) {
        setInviteForm({ email: '', role: UserRole.OPERATOR })
        fetchUsers() // Refresh user list
        alert('Invitation sent successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to send invitation: ${error.message}`)
      }
    } catch (error) {
      alert('Error sending invitation')
    } finally {
      setInviting(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        fetchUsers() // Refresh user list
      } else {
        alert('Failed to update user role')
      }
    } catch (error) {
      alert('Error updating user role')
    }
  }

  const copyCompanyCode = () => {
    if (companyInfo?.code) {
      navigator.clipboard.writeText(companyInfo.code)
      alert('Company code copied to clipboard!')
    }
  }

  return (
    <ManagerOnly fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Manager Access Required</h2>
          <p className="text-muted-foreground">
            Only managers can access user management.
          </p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage team members and their access levels
          </p>
        </div>

        {/* Company Info Card */}
        {companyInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Share this code with team members to join your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Company Name</Label>
                  <p className="font-medium">{companyInfo.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Join Code</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {companyInfo.code}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyCompanyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite User Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Send an invitation to add a new team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value={UserRole.MANAGER}>Manager - Full Access</option>
                    <option value={UserRole.OPERATOR}>Operator - Production Focus</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={inviting}>
                <Mail className="h-4 w-4 mr-2" />
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({users.length})
            </CardTitle>
            <CardDescription>
              Manage existing team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found. Send your first invitation above.
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : user.email
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === UserRole.MANAGER ? "default" : "secondary"}>
                        {user.role === UserRole.MANAGER ? (
                          <><ShieldCheck className="h-3 w-3 mr-1" /> Manager</>
                        ) : (
                          <><Shield className="h-3 w-3 mr-1" /> Operator</>
                        )}
                      </Badge>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        className="w-32 rounded-md border border-gray-300 bg-white py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.OPERATOR}>Operator</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagerOnly>
  )
}