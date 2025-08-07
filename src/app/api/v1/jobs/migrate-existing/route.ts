import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { generateOperationsFromQuoteLineItems } from '@/lib/scheduling-engine'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all jobs without job_operations
    const { data: jobsWithoutOperations, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        description,
        quantity,
        estimated_cost,
        due_date
      `)
      .eq('tenant_id', user.tenant_id)
      .not('id', 'in', `(
        SELECT DISTINCT job_id 
        FROM job_operations 
        WHERE job_id IS NOT NULL
      )`)

    if (jobsError) {
      console.error('Error fetching jobs without operations:', jobsError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    const results = {
      processed: 0,
      created_operations: 0,
      errors: [] as string[]
    }

    for (const job of jobsWithoutOperations || []) {
      try {
        // Create basic operations for jobs without specific operations
        const basicOperations = [
          {
            name: `Production - ${job.description || job.job_number}`,
            sequenceOrder: 1,
            estimatedDuration: 240, // 4 hours default
            workCenterId: null
          },
          {
            name: 'Quality Control & Inspection',
            sequenceOrder: 2,
            estimatedDuration: 60, // 1 hour
            workCenterId: null
          }
        ]

        // Insert job operations
        const jobOperationsData = basicOperations.map(op => ({
          job_id: job.id,
          operation_name: op.name,
          sequence_order: op.sequenceOrder,
          estimated_duration: op.estimatedDuration,
          work_center_id: op.workCenterId,
          status: 'pending'
        }))

        const { data: createdOperations, error: operationsError } = await supabase
          .from('job_operations')
          .insert(jobOperationsData)
          .select()

        if (operationsError) {
          console.error(`Error creating operations for job ${job.job_number}:`, operationsError)
          results.errors.push(`${job.job_number}: ${operationsError.message}`)
          continue
        }

        results.processed++
        results.created_operations += createdOperations?.length || 0

      } catch (error) {
        console.error(`Error processing job ${job.job_number}:`, error)
        results.errors.push(`${job.job_number}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Migration completed. Processed ${results.processed} jobs, created ${results.created_operations} operations.`,
      results
    })

  } catch (error) {
    console.error('Migration API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}