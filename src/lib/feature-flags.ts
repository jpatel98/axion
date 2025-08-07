/**
 * Feature Flag System for Seamless Integration Rollout
 * Allows gradual deployment of integration features
 */

export interface FeatureFlag {
  enabled: boolean
  rolloutPercentage: number
  enabledFor: string[] // user IDs or tenant IDs
}

export interface FeatureFlags {
  AUTO_JOB_SCHEDULING: FeatureFlag
  REAL_TIME_UPDATES: FeatureFlag
  PREDICTIVE_SCHEDULING: FeatureFlag
  ENHANCED_QUOTE_CONVERSION: FeatureFlag
  SMART_SCHEDULING_SUGGESTIONS: FeatureFlag
}

// Default feature flag configuration
export const FEATURE_FLAGS: FeatureFlags = {
  AUTO_JOB_SCHEDULING: {
    enabled: process.env.FEATURE_AUTO_SCHEDULING === 'true',
    rolloutPercentage: parseInt(process.env.FEATURE_AUTO_SCHEDULING_ROLLOUT || '0'),
    enabledFor: []
  },
  REAL_TIME_UPDATES: {
    enabled: process.env.FEATURE_REAL_TIME_UPDATES === 'true',
    rolloutPercentage: parseInt(process.env.FEATURE_REAL_TIME_UPDATES_ROLLOUT || '0'),
    enabledFor: []
  },
  PREDICTIVE_SCHEDULING: {
    enabled: process.env.FEATURE_PREDICTIVE_SCHEDULING === 'true',
    rolloutPercentage: parseInt(process.env.FEATURE_PREDICTIVE_SCHEDULING_ROLLOUT || '0'),
    enabledFor: []
  },
  ENHANCED_QUOTE_CONVERSION: {
    enabled: process.env.FEATURE_ENHANCED_QUOTE_CONVERSION === 'true',
    rolloutPercentage: parseInt(process.env.FEATURE_ENHANCED_QUOTE_CONVERSION_ROLLOUT || '0'),
    enabledFor: []
  },
  SMART_SCHEDULING_SUGGESTIONS: {
    enabled: process.env.FEATURE_SMART_SCHEDULING_SUGGESTIONS === 'true',
    rolloutPercentage: parseInt(process.env.FEATURE_SMART_SCHEDULING_SUGGESTIONS_ROLLOUT || '0'),
    enabledFor: []
  }
}

/**
 * Check if a feature is enabled for a specific user/tenant
 */
export function isFeatureEnabled(
  featureName: keyof FeatureFlags,
  userId?: string,
  tenantId?: string
): boolean {
  const flag = FEATURE_FLAGS[featureName]
  
  // Feature disabled globally
  if (!flag.enabled) return false
  
  // Feature enabled for specific users/tenants
  if (userId && flag.enabledFor.includes(userId)) return true
  if (tenantId && flag.enabledFor.includes(tenantId)) return true
  
  // Rollout percentage check (simple hash-based)
  if (flag.rolloutPercentage > 0) {
    const identifier = userId || tenantId || 'anonymous'
    const hash = simpleHash(identifier)
    return (hash % 100) < flag.rolloutPercentage
  }
  
  return false
}

/**
 * Simple hash function for rollout percentage calculation
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(featureName: keyof FeatureFlags) {
  // In a real implementation, this would get user/tenant context
  // For now, we'll use environment variables
  const isEnabled = isFeatureEnabled(featureName)
  
  return {
    isEnabled,
    flag: FEATURE_FLAGS[featureName]
  }
}

/**
 * Development helper to enable features for testing
 */
export function enableFeatureForTesting(
  featureName: keyof FeatureFlags,
  enabled: boolean = true
) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    FEATURE_FLAGS[featureName].enabled = enabled
  }
}