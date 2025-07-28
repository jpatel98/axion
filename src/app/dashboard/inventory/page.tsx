'use client'

import { useState } from 'react'
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock inventory data
const mockInventory = [
  {
    id: '1',
    name: 'Steel Rod 1/2"',
    sku: 'STL-ROD-05',
    category: 'Raw Materials',
    quantity: 250,
    unit: 'pieces',
    min_stock: 100,
    max_stock: 500,
    cost_per_unit: 12.50,
    location: 'A-1-2',
    supplier: 'Steel Supply Co',
    last_updated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Aluminum Sheet 16ga',
    sku: 'ALU-SHT-16',
    category: 'Raw Materials', 
    quantity: 45,
    unit: 'sheets',
    min_stock: 50,
    max_stock: 200,
    cost_per_unit: 28.75,
    location: 'B-2-1',
    supplier: 'Metro Metals',
    last_updated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Cutting Fluid - Premium',
    sku: 'CUT-FLD-001',
    category: 'Consumables',
    quantity: 12,
    unit: 'gallons',
    min_stock: 10,
    max_stock: 50,
    cost_per_unit: 45.00,
    location: 'C-1-3',
    supplier: 'Industrial Supply',
    last_updated: '2024-01-13'
  }
]

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

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = mockInventory.filter(item => item.quantity <= item.min_stock).length
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track and manage your raw materials, tools, and finished goods
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockInventory.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock Alerts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {lowStockItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalValue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reorder Soon
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">5</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.min_stock, item.max_stock)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {item.quantity} {item.unit}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(stockStatus)}`}>
                            {stockStatus === 'low' ? 'Low Stock' : stockStatus === 'high' ? 'Overstocked' : 'Normal'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {item.min_stock} • Max: {item.max_stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(item.quantity * item.cost_per_unit).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}