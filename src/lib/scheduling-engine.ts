/**
 * Smart Scheduling Engine for Manufacturing Operations
 * Provides intelligent scheduling suggestions and conflict detection
 */

import { formatLocalDate, calculateDaysDifference, parseLocalDate } from './date-utils'

export interface JobData {
  id?: string
  jobNumber: string
  customerId?: string
  dueDate: string // YYYY-MM-DD format
  estimatedDuration: number // in hours
  operations: Operation[]
  priorityLevel: number // 1-5 scale
  quantity: number
}

export interface Operation {
  id?: string
  name: string
  operationNumber: number
  estimatedHours: number // in hours
  workCenterId?: string
  requiredSkills?: string[]
}

export interface WorkCenterCapacity {
  workCenterId: string
  name: string
  maxCapacity: number // concurrent jobs
  currentLoad: number
  hourlyRate?: number
  availableHours: TimeSlot[]
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  workCenterId: string
  conflictingJobs?: string[]
}

export interface SchedulingSuggestion {
  jobId?: string
  jobNumber: string
  suggestedStartDate: Date
  suggestedEndDate: Date
  workCenterAssignments: WorkCenterAssignment[]
  conflictWarnings: ConflictWarning[]
  optimizationNotes: string[]
  confidenceScore: number // 0-100
  estimatedCost?: number
}

export interface WorkCenterAssignment {
  operationId: string
  operationName: string
  workCenterId: string
  workCenterName: string
  scheduledStart: Date
  scheduledEnd: Date
  estimatedHours: number
}

export interface ConflictWarning {
  type: 'capacity' | 'timing' | 'resource' | 'dependency'
  severity: 'low' | 'medium' | 'high'
  message: string
  affectedOperations: string[]
  suggestedResolution?: string
}

/**
 * Main Scheduling Engine Class
 */
export class SchedulingEngine {
  /**
   * Generate scheduling suggestions for a job
   */
  async generateSchedulingSuggestions(
    jobData: JobData,
    workCenterCapacity?: WorkCenterCapacity[]
  ): Promise<SchedulingSuggestion> {
    // Get work center capacity if not provided
    const capacity = workCenterCapacity || await this.getWorkCenterCapacity()
    
    // Calculate optimal start date based on due date and duration
    const optimalStartDate = this.calculateOptimalStartDate(jobData)
    
    // Find available time slots for each operation
    const workCenterAssignments = await this.assignOperationsToWorkCenters(
      jobData.operations,
      optimalStartDate,
      capacity
    )
    
    // Detect potential conflicts
    const conflictWarnings = await this.detectConflicts(workCenterAssignments, capacity)
    
    // Generate optimization recommendations
    const optimizationNotes = this.generateOptimizationNotes(
      workCenterAssignments,
      conflictWarnings,
      jobData
    )
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      conflictWarnings,
      workCenterAssignments
    )
    
    return {
      jobNumber: jobData.jobNumber,
      suggestedStartDate: optimalStartDate,
      suggestedEndDate: this.calculateEndDate(workCenterAssignments),
      workCenterAssignments,
      conflictWarnings,
      optimizationNotes,
      confidenceScore
    }
  }
  
  /**
   * Calculate optimal start date working backward from due date
   */
  private calculateOptimalStartDate(jobData: JobData): Date {
    const dueDate = parseLocalDate(jobData.dueDate)
    const totalDurationMs = jobData.estimatedDuration * 60 * 60 * 1000 // hours to ms
    
    // Add buffer time (20% of estimated duration)
    const bufferMs = totalDurationMs * 0.2
    
    // Calculate start date (due date - duration - buffer)
    const startDate = new Date(dueDate.getTime() - totalDurationMs - bufferMs)
    
    // Don't schedule in the past
    const now = new Date()
    return startDate < now ? now : startDate
  }
  
  /**
   * Assign operations to work centers based on availability
   */
  private async assignOperationsToWorkCenters(
    operations: Operation[],
    startDate: Date,
    capacity: WorkCenterCapacity[]
  ): Promise<WorkCenterAssignment[]> {
    const assignments: WorkCenterAssignment[] = []
    let currentDate = new Date(startDate)
    
    // Sort operations by operation number
    const sortedOps = [...operations].sort((a, b) => a.operationNumber - b.operationNumber)
    
    for (const operation of sortedOps) {
      // Find best work center for this operation
      const bestWorkCenter = this.findBestWorkCenter(operation, currentDate, capacity)
      
      if (!bestWorkCenter) {
        throw new Error(`No available work center found for operation: ${operation.name}`)
      }
      
      // Calculate end time for this operation (convert hours to milliseconds)
      const operationEndDate = new Date(
        currentDate.getTime() + (operation.estimatedHours * 60 * 60 * 1000)
      )
      
      assignments.push({
        operationId: operation.id || `temp-${operation.operationNumber}`,
        operationName: operation.name,
        workCenterId: bestWorkCenter.workCenterId,
        workCenterName: bestWorkCenter.name,
        scheduledStart: new Date(currentDate),
        scheduledEnd: operationEndDate,
        estimatedHours: operation.estimatedHours
      })
      
      // Next operation starts after this one completes
      currentDate = operationEndDate
    }
    
    return assignments
  }
  
  /**
   * Find the best work center for an operation
   */
  private findBestWorkCenter(
    operation: Operation,
    startTime: Date,
    capacity: WorkCenterCapacity[]
  ): WorkCenterCapacity | null {
    // If operation specifies a work center, try to use it
    if (operation.workCenterId) {
      const preferredCenter = capacity.find(c => c.workCenterId === operation.workCenterId)
      if (preferredCenter && this.isWorkCenterAvailable(preferredCenter, startTime, operation.estimatedHours)) {
        return preferredCenter
      }
    }
    
    // Find work center with lowest current load that can handle the operation
    const availableCenters = capacity.filter(center => 
      this.isWorkCenterAvailable(center, startTime, operation.estimatedHours)
    )
    
    if (availableCenters.length === 0) return null
    
    // Sort by current load (ascending) to balance workload
    return availableCenters.sort((a, b) => a.currentLoad - b.currentLoad)[0]
  }
  
  /**
   * Check if work center is available for the specified duration
   */
  private isWorkCenterAvailable(
    workCenter: WorkCenterCapacity,
    startTime: Date,
    durationHours: number
  ): boolean {
    const endTime = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000))
    
    // Check if work center has capacity
    if (workCenter.currentLoad >= workCenter.maxCapacity) {
      return false
    }
    
    // Check available time slots
    return workCenter.availableHours.some(slot => 
      slot.available && 
      slot.start <= startTime && 
      slot.end >= endTime
    )
  }
  
  /**
   * Detect potential scheduling conflicts
   */
  private async detectConflicts(
    assignments: WorkCenterAssignment[],
    capacity: WorkCenterCapacity[]
  ): Promise<ConflictWarning[]> {
    const warnings: ConflictWarning[] = []
    
    // Check for capacity conflicts
    const workCenterLoads = new Map<string, number>()
    
    for (const assignment of assignments) {
      const currentLoad = workCenterLoads.get(assignment.workCenterId) || 0
      const newLoad = currentLoad + 1
      workCenterLoads.set(assignment.workCenterId, newLoad)
      
      const workCenter = capacity.find(c => c.workCenterId === assignment.workCenterId)
      if (workCenter && newLoad > workCenter.maxCapacity) {
        warnings.push({
          type: 'capacity',
          severity: 'high',
          message: `Work center ${workCenter.name} will exceed capacity (${newLoad}/${workCenter.maxCapacity})`,
          affectedOperations: [assignment.operationId],
          suggestedResolution: 'Consider splitting operations across multiple work centers or adjusting timeline'
        })
      }
    }
    
    // Check for timing conflicts (operations scheduled too close together)
    for (let i = 0; i < assignments.length - 1; i++) {
      const current = assignments[i]
      const next = assignments[i + 1]
      
      const gap = next.scheduledStart.getTime() - current.scheduledEnd.getTime()
      const minGap = 15 * 60 * 1000 // 15 minutes minimum
      
      if (gap < minGap) {
        warnings.push({
          type: 'timing',
          severity: 'medium',
          message: `Tight scheduling between ${current.operationName} and ${next.operationName}`,
          affectedOperations: [current.operationId, next.operationId],
          suggestedResolution: 'Add buffer time between operations'
        })
      }
    }
    
    return warnings
  }
  
  /**
   * Generate optimization recommendations
   */
  private generateOptimizationNotes(
    assignments: WorkCenterAssignment[],
    conflicts: ConflictWarning[],
    jobData: JobData
  ): string[] {
    const notes: string[] = []
    
    if (conflicts.length === 0) {
      notes.push('Schedule looks optimal with no conflicts detected')
    } else {
      notes.push(`${conflicts.length} potential issues identified - review suggestions`)
    }
    
    // Check if job is high priority
    if (jobData.priorityLevel >= 4) {
      notes.push('High priority job - consider expediting or adding resources')
    }
    
    // Check if due date is tight
    const daysToComplete = calculateDaysDifference(jobData.dueDate)
    if (daysToComplete <= 7) {
      notes.push('Tight deadline - monitor progress closely and prepare contingency plans')
    }
    
    // Suggest optimization based on work center distribution
    const workCenterCount = new Set(assignments.map(a => a.workCenterId)).size
    if (workCenterCount === 1 && assignments.length > 2) {
      notes.push('All operations on single work center - consider parallel processing if possible')
    }
    
    return notes
  }
  
  /**
   * Calculate confidence score for the scheduling suggestion
   */
  private calculateConfidenceScore(
    conflicts: ConflictWarning[],
    assignments: WorkCenterAssignment[]
  ): number {
    let score = 100
    
    // Reduce score based on conflicts
    for (const conflict of conflicts) {
      switch (conflict.severity) {
        case 'high':
          score -= 25
          break
        case 'medium':
          score -= 15
          break
        case 'low':
          score -= 5
          break
      }
    }
    
    // Reduce score if scheduling is very tight
    const totalDuration = assignments.reduce((sum, a) => sum + a.estimatedHours, 0)
    const totalTimespan = assignments.length > 0 
      ? assignments[assignments.length - 1].scheduledEnd.getTime() - assignments[0].scheduledStart.getTime()
      : 0
    
    const utilizationRatio = totalDuration > 0 ? (totalDuration * 60 * 60 * 1000) / totalTimespan : 0
    
    if (utilizationRatio > 0.9) {
      score -= 10 // Very tight schedule
    }
    
    return Math.max(0, Math.min(100, score))
  }
  
  /**
   * Calculate end date from work center assignments
   */
  private calculateEndDate(assignments: WorkCenterAssignment[]): Date {
    if (assignments.length === 0) return new Date()
    
    return assignments.reduce((latest, assignment) => {
      return assignment.scheduledEnd > latest ? assignment.scheduledEnd : latest
    }, assignments[0].scheduledEnd)
  }
  
  /**
   * Get work center capacity data
   * In real implementation, this would fetch from database
   */
  private async getWorkCenterCapacity(): Promise<WorkCenterCapacity[]> {
    // Mock data - replace with actual database query
    const now = new Date()
    const eightHoursLater = new Date(now.getTime() + (8 * 60 * 60 * 1000))
    
    return [
      {
        workCenterId: 'wc-1',
        name: 'CNC Machining',
        maxCapacity: 2,
        currentLoad: 0,
        hourlyRate: 85,
        availableHours: [{
          start: now,
          end: eightHoursLater,
          available: true,
          workCenterId: 'wc-1'
        }]
      },
      {
        workCenterId: 'wc-2', 
        name: 'Welding Station',
        maxCapacity: 3,
        currentLoad: 1,
        hourlyRate: 65,
        availableHours: [{
          start: now,
          end: eightHoursLater,
          available: true,
          workCenterId: 'wc-2'
        }]
      }
    ]
  }
}

/**
 * Utility function to generate operations from quote line items
 */
export function generateOperationsFromQuoteLineItems(
  lineItems: any[]
): Operation[] {
  const operations: Operation[] = []
  let operationNumber = 1
  
  for (const item of lineItems) {
    // Basic operation mapping - this would be more sophisticated in practice
    if (item.description.toLowerCase().includes('machining')) {
      operations.push({
        name: `CNC Machining - ${item.description}`,
        operationNumber: operationNumber++,
        estimatedHours: Math.max(1, item.quantity * 0.17), // ~10 min per unit converted to hours
        workCenterId: 'wc-1'
      })
    }
    
    if (item.description.toLowerCase().includes('welding')) {
      operations.push({
        name: `Welding - ${item.description}`,
        operationNumber: operationNumber++,
        estimatedHours: Math.max(0.5, item.quantity * 0.08), // ~5 min per unit converted to hours
        workCenterId: 'wc-2'
      })
    }
    
    if (item.description.toLowerCase().includes('assembly')) {
      operations.push({
        name: `Assembly - ${item.description}`,
        operationNumber: operationNumber++,
        estimatedHours: Math.max(0.75, item.quantity * 0.13), // ~8 min per unit converted to hours
        workCenterId: 'wc-3'
      })
    }
    
    // Default operation if no specific keywords found
    if (operations.length === 0 || operations.length < operationNumber - 1) {
      operations.push({
        name: `Production - ${item.description}`,
        operationNumber: operationNumber++,
        estimatedHours: Math.max(0.5, item.quantity * 0.08), // ~5 min per unit converted to hours
        requiredSkills: ['general']
      })
    }
  }
  
  // Always end with quality control
  operations.push({
    name: 'Quality Control & Inspection',
    operationNumber: operationNumber,
    estimatedHours: 1, // 1 hour
    workCenterId: 'wc-4'
  })
  
  return operations
}

/**
 * Default scheduling engine instance
 */
export const schedulingEngine = new SchedulingEngine()