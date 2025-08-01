#!/usr/bin/env node

/**
 * Seed Test Data Script for Axion Manufacturing ERP
 * 
 * This script safely adds test data to your production database by:
 * 1. Using your existing tenant_id to scope data
 * 2. Prefixing all test data with [TEST] for easy identification
 * 3. Creating realistic manufacturing scenarios
 * 4. Providing easy cleanup functionality
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test data prefixes for easy identification
const TEST_PREFIX = '[TEST]'
const TEST_JOB_PREFIX = 'TEST-'
const TEST_CUSTOMER_PREFIX = '[TEST] '

async function getTenantId() {
  // You'll need to replace this with your actual tenant_id
  // You can find this by checking your users table or by logging in and checking the browser dev tools
  console.log('🔍 Finding your tenant ID...')
  
  // This would typically come from your auth session, but for seeding we need to provide it
  // Check your database users table or settings table to find your tenant_id
  const { data: users, error } = await supabase
    .from('users')
    .select('tenant_id')
    .limit(1)
  
  if (error) {
    console.error('❌ Error finding tenant:', error)
    return null
  }
  
  if (users && users.length > 0) {
    return users[0].tenant_id
  }
  
  console.log('⚠️  No tenant found. Please check your database setup.')
  return null
}

async function seedTestData() {
  console.log('🌱 Starting test data seeding...')
  
  const tenantId = await getTenantId()
  if (!tenantId) {
    console.error('❌ Cannot proceed without tenant ID')
    return
  }
  
  console.log(`📋 Using tenant ID: ${tenantId}`)
  
  try {
    // 1. Create test customers
    console.log('👥 Creating test customers...')
    const customers = [
      {
        tenant_id: tenantId,
        name: `${TEST_CUSTOMER_PREFIX}Aerospace Solutions Inc`,
        email: 'test@aerospace-solutions.com',
        phone: '555-0101',
        contact_person: 'John Smith',
        city: 'Toronto',
        state: 'ON',
        country: 'Canada'
      },
      {
        tenant_id: tenantId,
        name: `${TEST_CUSTOMER_PREFIX}Precision Manufacturing Co`,
        email: 'test@precision-mfg.com',
        phone: '555-0102',
        contact_person: 'Sarah Johnson',
        city: 'Vancouver',
        state: 'BC',
        country: 'Canada'
      },
      {
        tenant_id: tenantId,
        name: `${TEST_CUSTOMER_PREFIX}AutoParts Direct`,
        email: 'test@autoparts-direct.com',
        phone: '555-0103',
        contact_person: 'Mike Wilson',
        city: 'Calgary',
        state: 'AB',
        country: 'Canada'
      }
    ]
    
    const { data: createdCustomers, error: customerError } = await supabase
      .from('customers')
      .insert(customers)
      .select()
    
    if (customerError) throw customerError
    console.log(`✅ Created ${createdCustomers.length} test customers`)
    
    // 2. Create test work centers
    console.log('🏭 Creating test work centers...')
    const workCenters = [
      {
        tenant_id: tenantId,
        name: `${TEST_PREFIX} CNC Mill #1`,
        description: 'Haas VF-2 CNC Milling Machine',
        machine_type: 'CNC Mill',
        capacity_hours_per_day: 16,
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: `${TEST_PREFIX} CNC Lathe #2`,
        description: 'Haas ST-20 CNC Lathe',
        machine_type: 'CNC Lathe',
        capacity_hours_per_day: 20,
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: `${TEST_PREFIX} Manual Mill`,
        description: 'Bridgeport Manual Milling Machine',
        machine_type: 'Manual Mill',
        capacity_hours_per_day: 8,
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: `${TEST_PREFIX} Welding Station`,
        description: 'TIG/MIG Welding Setup',
        machine_type: 'Welding',
        capacity_hours_per_day: 10,
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: `${TEST_PREFIX} Assembly Bench`,
        description: 'Main assembly and quality control area',
        machine_type: 'Assembly',
        capacity_hours_per_day: 8,
        is_active: false // One inactive for testing
      }
    ]
    
    const { data: createdWorkCenters, error: workCenterError } = await supabase
      .from('work_centers')
      .insert(workCenters)
      .select()
    
    if (workCenterError) throw workCenterError
    console.log(`✅ Created ${createdWorkCenters.length} test work centers`)
    
    // 3. Create test jobs with realistic manufacturing scenarios
    console.log('📦 Creating test jobs...')
    const jobs = [
      {
        tenant_id: tenantId,
        job_number: `${TEST_JOB_PREFIX}J001`,
        customer_name: createdCustomers[0].name,
        part_number: 'ASI-BRACKET-001',
        description: 'Aluminum mounting bracket for aerospace application',
        quantity: 50,
        estimated_cost: 2500.00,
        actual_cost: 0,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      },
      {
        tenant_id: tenantId,
        job_number: `${TEST_JOB_PREFIX}J002`,
        customer_name: createdCustomers[1].name,
        part_number: 'PMC-SHAFT-042',
        description: 'Precision machined shaft with tight tolerances',
        quantity: 25,
        estimated_cost: 3750.00,
        actual_cost: 3200.00,
        status: 'in_progress',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      },
      {
        tenant_id: tenantId,
        job_number: `${TEST_JOB_PREFIX}J003`,
        customer_name: createdCustomers[2].name,
        part_number: 'APD-GEAR-128',
        description: 'Custom gear for automotive transmission',
        quantity: 100,
        estimated_cost: 8500.00,
        actual_cost: 8750.00,
        status: 'completed',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        tenant_id: tenantId,
        job_number: `${TEST_JOB_PREFIX}J004`,
        customer_name: createdCustomers[0].name,
        part_number: 'ASI-HOUSING-203',
        description: 'Machined aluminum housing assembly',
        quantity: 75,
        estimated_cost: 12000.00,
        actual_cost: 11800.00,
        status: 'shipped',
        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      },
      {
        tenant_id: tenantId,
        job_number: `${TEST_JOB_PREFIX}J005`,
        customer_name: createdCustomers[1].name,
        part_number: 'PMC-PLATE-067',
        description: 'Steel base plate with mounting holes',
        quantity: 200,
        estimated_cost: 4200.00,
        actual_cost: 0,
        status: 'pending',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() // 21 days from now
      }
    ]
    
    const { data: createdJobs, error: jobError } = await supabase
      .from('jobs')
      .insert(jobs)
      .select()
    
    if (jobError) throw jobError
    console.log(`✅ Created ${createdJobs.length} test jobs`)
    
    // 4. Create job operations for the jobs
    console.log('⚙️ Creating job operations...')
    const operations = []
    
    // Job 1 operations (ASI-BRACKET-001)
    operations.push(
      {
        tenant_id: tenantId,
        job_id: createdJobs[0].id,
        name: 'Material Prep',
        description: 'Cut aluminum stock to size',
        operation_number: 1,
        estimated_hours: 2.0,
        status: 'pending'
      },
      {
        tenant_id: tenantId,
        job_id: createdJobs[0].id,
        name: 'CNC Milling',
        description: 'Machine bracket profile and mounting holes',
        operation_number: 2,
        estimated_hours: 4.5,
        status: 'pending'
      },
      {
        tenant_id: tenantId,
        job_id: createdJobs[0].id,
        name: 'Deburring',
        description: 'Remove sharp edges and burrs',
        operation_number: 3,
        estimated_hours: 1.0,
        status: 'pending'
      }
    )
    
    // Job 2 operations (PMC-SHAFT-042) - In progress
    operations.push(
      {
        tenant_id: tenantId,
        job_id: createdJobs[1].id,
        name: 'Material Prep',
        description: 'Prepare steel round stock',
        operation_number: 1,
        estimated_hours: 1.0,
        status: 'completed'
      },
      {
        tenant_id: tenantId,
        job_id: createdJobs[1].id,
        name: 'CNC Turning',
        description: 'Turn shaft to specifications',
        operation_number: 2,
        estimated_hours: 6.0,
        status: 'in_progress'
      },
      {
        tenant_id: tenantId,
        job_id: createdJobs[1].id,
        name: 'Quality Check',
        description: 'Dimensional inspection and surface finish check',
        operation_number: 3,
        estimated_hours: 0.5,
        status: 'pending'
      }
    )
    
    const { data: createdOperations, error: operationError } = await supabase
      .from('job_operations')
      .insert(operations)
      .select()
    
    if (operationError) throw operationError
    console.log(`✅ Created ${createdOperations.length} job operations`)
    
    // 5. Create some scheduled operations for the scheduler page
    console.log('📅 Creating scheduled operations...')
    const scheduledOps = [
      {
        tenant_id: tenantId,
        job_operation_id: createdOperations[1].id, // CNC Milling for Job 1
        work_center_id: createdWorkCenters[0].id, // CNC Mill #1
        scheduled_start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow 8 AM
        scheduled_end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4.5 * 60 * 60 * 1000).toISOString(), // 4.5 hours later
        notes: 'Priority job for aerospace customer'
      },
      {
        tenant_id: tenantId,
        job_operation_id: createdOperations[4].id, // CNC Turning for Job 2 (in progress)
        work_center_id: createdWorkCenters[1].id, // CNC Lathe #2
        scheduled_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
        scheduled_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 more hours
        actual_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Currently running - on schedule'
      }
    ]
    
    const { data: createdScheduled, error: scheduledError } = await supabase
      .from('scheduled_operations')
      .insert(scheduledOps)
      .select()
    
    if (scheduledError) throw scheduledError
    console.log(`✅ Created ${createdScheduled.length} scheduled operations`)
    
    // Summary
    console.log('\n🎉 Test data seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   • ${createdCustomers.length} test customers`)
    console.log(`   • ${createdWorkCenters.length} test work centers`)
    console.log(`   • ${createdJobs.length} test jobs`)
    console.log(`   • ${createdOperations.length} job operations`)
    console.log(`   • ${createdScheduled.length} scheduled operations`)
    console.log('\n🔍 All test data is prefixed with "[TEST]" for easy identification')
    console.log('🧹 Run "npm run cleanup-test-data" to remove all test data')
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    console.log('\n🔧 If you see column errors, the database schema might need updates.')
    console.log('📝 Check the database files in the /database folder for the latest schema.')
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')
  
  const tenantId = await getTenantId()
  if (!tenantId) {
    console.error('❌ Cannot proceed without tenant ID')
    return
  }
  
  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('scheduled_operations').delete().match({ tenant_id: tenantId }).contains('notes', 'Priority job')
    await supabase.from('job_operations').delete().match({ tenant_id: tenantId })
    await supabase.from('jobs').delete().match({ tenant_id: tenantId }).like('job_number', `${TEST_JOB_PREFIX}%`)
    await supabase.from('work_centers').delete().match({ tenant_id: tenantId }).like('name', `${TEST_PREFIX}%`)
    await supabase.from('customers').delete().match({ tenant_id: tenantId }).like('name', `${TEST_CUSTOMER_PREFIX}%`)
    
    console.log('✅ Test data cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error)
  }
}

// Command line interface
const command = process.argv[2]

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

if (command === 'cleanup') {
  cleanupTestData()
} else {
  seedTestData()
}