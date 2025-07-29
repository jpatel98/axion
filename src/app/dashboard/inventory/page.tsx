'use client'

import { useState } from 'react'
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Note: This will be replaced with real inventory data from your database

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Raw Materials', 'Consumables', 'Tools', 'Finished Goods']

  const getStockStatus = (quantity: number, minStock: number, maxStock: number) => {
    if (quantity <= minStock) return 'low'
    if (quantity >= maxStock) return 'high'
    return 'normal'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  // Note: Inventory filtering and calculations will be implemented when database is connected

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
            <p className="mt-2 text-sm text-slate-800">
              Track and manage your raw materials, tools, and finished goods
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Inventory Coming Soon */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-16">
            <Package className="mx-auto h-20 w-20 text-slate-800" />
            <h3 className="mt-4 text-xl font-medium text-slate-800">Inventory Management Coming Soon</h3>
            <p className="mt-2 text-sm text-slate-800 max-w-md mx-auto">
              Start adding your raw materials, tools, and finished goods to track stock levels, set reorder points, and manage your inventory efficiently.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Package className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <p className="text-sm text-slate-800">Raw Materials</p>
                <p className="text-xs text-slate-800">Steel, aluminum, etc.</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <p className="text-sm text-slate-800">Stock Alerts</p>
                <p className="text-xs text-slate-800">Low stock warnings</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <TrendingUp className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <p className="text-sm text-slate-800">Value Tracking</p>
                <p className="text-xs text-slate-800">Total inventory value</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <TrendingDown className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <p className="text-sm text-slate-800">Reorder Points</p>
                <p className="text-xs text-slate-800">Automated alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Feature Preview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Planned Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Search className="h-5 w-5 text-slate-800 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-800">Advanced Search & Filtering</p>
                <p className="text-xs text-slate-800">Search by name, SKU, category, location</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-slate-800 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-800">Stock Level Monitoring</p>
                <p className="text-xs text-slate-800">Automatic low stock alerts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-slate-800 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-800">Barcode Integration</p>
                <p className="text-xs text-slate-800">Scan items for quick updates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-slate-800 mt-1" />
              <div>
                <p className="text-sm font-medium text-slate-800">Usage Analytics</p>
                <p className="text-xs text-slate-800">Track consumption patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}