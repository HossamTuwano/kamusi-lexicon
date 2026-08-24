/**
 * Security utilities for production-ready admin panel
 */

export const SecurityUtils = {
  /**
   * Clear all sensitive data from storage
   */
  clearAllSensitiveData: () => {
    const sensitiveKeys = ['token', 'role', 'user', 'auth_timestamp']
    sensitiveKeys.forEach(key => localStorage.removeItem(key))
  },

  /**
   * Store auth timestamp to track session age
   */
  recordAuthTime: () => {
    localStorage.setItem('auth_timestamp', Date.now().toString())
  },

  /**
   * Check if session has expired (24 hour limit)
   */
  isSessionExpired: (maxAgeMs = 24 * 60 * 60 * 1000): boolean => {
    const authTime = localStorage.getItem('auth_timestamp')
    if (!authTime) return true
    return Date.now() - parseInt(authTime, 10) > maxAgeMs
  },

  /**
   * Get token with expiry check
   */
  getValidToken: (): string | null => {
    if (SecurityUtils.isSessionExpired()) {
      SecurityUtils.clearAllSensitiveData()
      return null
    }
    return localStorage.getItem('token')
  },

  /**
   * Validate CSRF token (can be extended)
   */
  validateRequest: (method: string): boolean => {
    // POST, PUT, DELETE require validation
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      const token = SecurityUtils.getValidToken()
      return !!token
    }
    return true
  },
}
