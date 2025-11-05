import { defineStore } from 'pinia'
import { useCookie, useNuxtApp } from '#app'
import { ref } from 'vue'

const hasNuxtAppInstance = () => {
  try {
    return !!useNuxtApp()
  } catch (error) {
    return false
  }
}

const safeUseCookie = <T = any>(name: string, options?: any) => {
  if (!hasNuxtAppInstance()) {
    return ref<T | null>(null)
  }
  return useCookie<T>(name, options)
}

type AccessRole = 'unknown' | 'manager' | 'assigned' | 'none'

interface AssignmentInfo {
  id: string
  name: string
  assignedAt?: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any | null,
    isInitialized: false,
    isLoading: false,
    accessRole: 'unknown' as AccessRole,
    assignmentInfo: null as AssignmentInfo | null
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoggedIn: (state) => !!state.user,
    hasRole: (state) => (role: string) => state.user?.role === role,
    isManager: (state) => state.user?.role === 'manager' || state.user?.role === 'hrd_admin',
    isHRAdmin: (state) => state.user?.role === 'hrd_admin',
    // Role ตาม level ในฐานข้อมูล
    getUserLevel: (state) => parseInt(state.user?.level || '0'),
    isHighLevel: (state) => parseInt(state.user?.level || '0') >= 8, // ระดับ 8 ขึ้นไป
    isSupervisor: (state) => parseInt(state.user?.level || '0') >= 10, // ระดับ 10 ขึ้นไป (ผู้จัดการ)
    canAccessApp: (state) => state.accessRole === 'manager' || state.accessRole === 'assigned',
    isAssignedStaff: (state) => state.accessRole === 'assigned'
  },
  actions: {
    persistAccessRole(role: AccessRole | null, assignment: AssignmentInfo | null) {
      const roleCookie = safeUseCookie<string | null>('auth_access_role', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      const assignmentCookie = safeUseCookie<string | null>('auth_assignment_info', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })

      roleCookie.value = role
      assignmentCookie.value = assignment ? JSON.stringify(assignment) : null

      if (typeof window !== 'undefined') {
        if (role) {
          localStorage.setItem('auth_access_role', role)
        } else {
          localStorage.removeItem('auth_access_role')
        }

        if (assignment) {
          localStorage.setItem('auth_assignment_info', JSON.stringify(assignment))
        } else {
          localStorage.removeItem('auth_assignment_info')
        }
      }
    },
    setAccessRole(role: AccessRole, assignment: AssignmentInfo | null = null) {
      this.accessRole = role
      this.assignmentInfo = assignment
      this.persistAccessRole(role, assignment)
    },
    clearAccessRole() {
      this.accessRole = 'none'
      this.assignmentInfo = null
      this.persistAccessRole(null, null)
    },
    setToken(token: string | null) {
      this.token = token

      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('auth_token', token)
        } else {
          localStorage.removeItem('auth_token')
        }
      }

      const tokenCookie = safeUseCookie<string | null>('auth_token', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      tokenCookie.value = token
    },
    setUser(user: any) {
      this.user = user
      // Store user in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

      const userCookie = safeUseCookie<any>('auth_user', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      userCookie.value = user
    },
    async refreshAccessRole(options: { keepStateOnError?: boolean } = {}) {
      const { keepStateOnError = false } = options

      if (!this.user?.id) {
        this.clearAccessRole()
        return { canAccess: false, reason: 'no-user' as const }
      }

      try {
        const response = await fetch('http://localhost:4001/api/assignments/my-status', {
          credentials: 'include'
        })

        if (!response.ok) {
          if (keepStateOnError && response.status >= 500) {
            console.warn('Access role refresh encountered server error, keeping current session state.')
            return { canAccess: this.canAccessApp, reason: 'server' as const }
          }

          this.clearAccessRole()
          return {
            canAccess: false,
            reason: response.status === 401 || response.status === 403 ? 'unauthorized' as const : 'server' as const
          }
        }

        const status = await response.json()

        if (status.canAccess) {
          const role: AccessRole = status.role === 'manager' ? 'manager' : 'assigned'
          const assignment: AssignmentInfo | null = status.role === 'assigned' && status.assignedBy
            ? {
                id: status.assignedBy.id,
                name: status.assignedBy.name,
                assignedAt: status.assignedBy.assignedAt
              }
            : null
          this.setAccessRole(role, assignment)
          return { canAccess: true, reason: null }
        }

        this.clearAccessRole()
        return { canAccess: false, reason: 'unauthorized' as const }
      } catch (error) {
        console.error('Access role refresh failed:', error)
        if (keepStateOnError) {
          return { canAccess: this.canAccessApp, reason: 'network' as const }
        }
        this.clearAccessRole()
        return { canAccess: false, reason: 'network' as const }
      }
    },
    async validateToken(options: { keepStateOnError?: boolean } = {}) {
      const { keepStateOnError = false } = options

      try {
        const response = await fetch('http://localhost:4001/api/auth/session', {
          credentials: 'include'
        })

        const data = await response.json().catch(() => ({}))

        if (response.ok && data?.ok && data.user) {
          this.setToken('session')
          this.setUser(data.user)
          const access = await this.refreshAccessRole({ keepStateOnError })

          if (!access.canAccess && access.reason === 'unauthorized') {
            if (!keepStateOnError) {
              this.clearClientState()
            }
            return false
          }

          return true
        }

        if (keepStateOnError && response.status >= 500) {
          console.warn('Session validation encountered a server error, keeping current client state.')
          return false
        }
      } catch (error) {
        console.error('Session validation failed:', error)
        if (keepStateOnError) {
          return false
        }
      }

      if (!keepStateOnError) {
        this.clearClientState()
      }
      return false
    },
    clearClientState() {
      this.token = null
      this.user = null
      this.clearAccessRole()

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_access_role')
        localStorage.removeItem('auth_assignment_info')
      }

    const tokenCookie = safeUseCookie<string | null>('auth_token')
    const userCookie = safeUseCookie<any>('auth_user')
      tokenCookie.value = null
      userCookie.value = null
    },
    async logout() {
      try {
        await fetch('http://localhost:4001/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.warn('Server logout failed, clearing client state only.', error)
      }

      this.isInitialized = false
      this.clearClientState()
    },
    async initializeAuth() {
      if (this.isInitialized) return

      this.isLoading = true

      try {
        const tokenCookie = safeUseCookie<string | null>('auth_token')
        const userCookie = safeUseCookie<any>('auth_user')
        const roleCookie = safeUseCookie<string | null>('auth_access_role')
        const assignmentCookie = safeUseCookie<string | null>('auth_assignment_info')

        let cachedToken = tokenCookie.value || null
        const cachedUserCookieValue = userCookie.value ?? null
        let cachedRole = roleCookie.value || null
        let cachedAssignment = assignmentCookie.value || null
        let cachedUserStorageStr: string | null = null

        if (typeof window !== 'undefined') {
          cachedToken = cachedToken || localStorage.getItem('auth_token')
          cachedUserStorageStr = localStorage.getItem('auth_user')
          cachedRole = cachedRole || localStorage.getItem('auth_access_role')
          cachedAssignment = cachedAssignment || localStorage.getItem('auth_assignment_info')
        }

        const hadCachedUserData = Boolean(cachedUserCookieValue || cachedUserStorageStr)

        if (cachedToken) {
          this.setToken(cachedToken)
        }

        const parseUserFromString = (value: string | null) => {
          if (!value) return null
          const trimmed = value.trim()
          if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
            return null
          }
          try {
            return JSON.parse(trimmed)
          } catch (error) {
            try {
              return JSON.parse(decodeURIComponent(trimmed))
            } catch {
              return null
            }
          }
        }

        let restoredUser: any = null

        if (cachedUserCookieValue) {
          if (typeof cachedUserCookieValue === 'string') {
            restoredUser = parseUserFromString(cachedUserCookieValue)
            if (!restoredUser) {
              console.warn('Failed to parse cached user, clearing persisted auth data.')
              userCookie.value = null
            }
          } else if (typeof cachedUserCookieValue === 'object') {
            restoredUser = cachedUserCookieValue
          }
        }

        if (!restoredUser && cachedUserStorageStr) {
          restoredUser = parseUserFromString(cachedUserStorageStr)
          if (!restoredUser && typeof window !== 'undefined') {
            console.warn('Failed to parse cached user stored in localStorage, removing it.')
            localStorage.removeItem('auth_user')
          }
        }

        if (restoredUser) {
          this.setUser(restoredUser)
        }

        if (cachedRole) {
          try {
            let parsedAssignment: AssignmentInfo | null = null
            const assignmentString = typeof cachedAssignment === 'string' ? cachedAssignment.trim() : ''

            if (assignmentString && assignmentString !== 'undefined' && assignmentString !== 'null') {
              const rawAssignment = parseUserFromString(cachedAssignment) as Record<string, any> | null

              const clearPersistedAssignment = () => {
                const assignmentCookie = safeUseCookie<string | null>('auth_assignment_info')
                assignmentCookie.value = null
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem('auth_assignment_info')
                  } catch {}
                }
              }

              if (rawAssignment && typeof rawAssignment === 'object') {
                const idValue = rawAssignment.id
                const normalizedId = typeof idValue === 'number'
                  ? String(idValue)
                  : typeof idValue === 'string'
                    ? idValue.trim()
                    : ''

                if (normalizedId) {
                  parsedAssignment = {
                    id: normalizedId,
                    name: typeof rawAssignment.name === 'string' ? rawAssignment.name : '',
                    assignedAt: typeof rawAssignment.assignedAt === 'string' ? rawAssignment.assignedAt : null
                  }
                } else {
                  console.warn('Cached assignment info missing id, discarding persisted value.')
                  clearPersistedAssignment()
                }
              } else {
                console.warn('Cached assignment info has invalid format, discarding persisted value.')
                clearPersistedAssignment()
              }
            }

            this.setAccessRole(cachedRole as AccessRole, parsedAssignment)
          } catch (error) {
            console.warn('Failed to parse cached assignment info, resetting access role.', error)
            this.clearAccessRole()
          }
        }

        const isValid = await this.validateToken({ keepStateOnError: hadCachedUserData })
        if (!isValid && !hadCachedUserData) {
          this.clearClientState()
        }
      } finally {
        this.isInitialized = true
        this.isLoading = false
      }
    },
    // เพิ่มฟังก์ชันสำหรับดึงข้อมูลผู้บังคับบัญชา
    async getSupervisorInfo() {
      if (!this.user?.id) return null
      try {
        const response = await fetch(`http://localhost:4001/api/employee/${this.user.id}/supervisor`)
        const data = await response.json()
        return data
      } catch (error) {
        console.error('Failed to get supervisor info:', error)
        return null
      }
    }
  }
})
