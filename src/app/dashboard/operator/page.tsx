import React from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Factory,
  ClipboardCheck,
  TrendingUp,
  Users,
  Package
} from 'lucide-react'
import { OperatorOnly, PermissionGate } from '@/components/rbac/PermissionGate'

export const metadata: Metadata = {
  title: 'Operator Dashboard - Manufacturing ERP',
  description: 'Shop floor operations dashboard for operators',
}

export default function OperatorDashboard() {
  return (
    <OperatorOnly fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            This page is only accessible to operators.
          </p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Floor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your production tasks and quality checks
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Users className="h-3 w-3 mr-1" />
            Operator
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 in progress, 1 pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                All passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                Above target (90%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Production Orders */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Production Orders</CardTitle>
            <CardDescription>
              Production orders currently assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Production Order 1 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">JOB-2024-001</h4>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Widget Assembly - Customer: ABC Corp
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      850 / 1000 units
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: Today 6:00 PM
                    </span>
                  </div>
                  <Progress value={85} className="mt-2" />
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <PermissionGate permission="canUpdateJobs">
                    <Button size="sm">Update Status</Button>
                  </PermissionGate>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>

              {/* Production Order 2 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">JOB-2024-002</h4>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Component Manufacturing - Customer: XYZ Ltd
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      0 / 500 units
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: Tomorrow 2:00 PM
                    </span>
                  </div>
                  <Progress value={0} className="mt-2" />
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <PermissionGate permission="canUpdateJobs">
                    <Button size="sm" variant="outline">Start Job</Button>
                  </PermissionGate>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Control Tasks */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Tasks</CardTitle>
              <CardDescription>
                Quality inspections requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h5 className="font-medium">Final Inspection - JOB-2024-001</h5>
                    <p className="text-sm text-muted-foreground">Due in 2 hours</p>
                  </div>
                  <PermissionGate permission="canViewQuality">
                    <Button size="sm">Inspect</Button>
                  </PermissionGate>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h5 className="font-medium">Material Quality Check</h5>
                    <p className="text-sm text-muted-foreground">Batch #MT-2024-12</p>
                  </div>
                  <PermissionGate permission="canViewQuality">
                    <Button size="sm">Inspect</Button>
                  </PermissionGate>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your recent production activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">Completed quality check for JOB-2023-099</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Factory className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">Updated production status for JOB-2024-001</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">Completed production for JOB-2023-098</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <PermissionGate permission="canViewQuality">
                <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                  <ClipboardCheck className="h-6 w-6" />
                  <span>Quality Check</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewProduction">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Factory className="h-6 w-6" />
                  <span>Production Status</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewInventory">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Package className="h-6 w-6" />
                  <span>Check Inventory</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewReports">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>My Reports</span>
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorOnly>
  )
}