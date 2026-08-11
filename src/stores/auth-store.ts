import { defineStore } from 'pinia'
import { login, logout, refresh, register } from '@/services/auth-service'
import { IDENTITY_ROLE, normalizeRole } from '@/types/permissions'
import type { AuthState, JwtResponse, LoginModel, RegisterModel } from '@/types/auth'

const STORAGE_KEY = 'restaurant-auth'

interface PersistedAuth {
  jwt: string
  refreshToken: string
  firstName: string
  lastName: string
  userId: string
  role: string
  identityRoles: string[]
}

interface JwtPayload {
  [key: string]: unknown
}

function decodeJwtPayload(jwt: string): JwtPayload | null {
  const payload = jwt.split('.')[1]
  if (!payload) {
    return null
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

function readClaimValues(payload: JwtPayload | null, names: string[]): string[] {
  if (!payload) {
    return []
  }

  const values: string[] = []
  for (const name of names) {
    const value = payload[name]
    if (typeof value === 'string') {
      values.push(value)
    } else if (Array.isArray(value)) {
      values.push(...value.filter((item): item is string => typeof item === 'string'))
    }
  }

  return values
}

function readStringClaim(payload: JwtPayload | null, names: string[]): string {
  return readClaimValues(payload, names)[0] ?? ''
}

function readRoleClaims(payload: JwtPayload | null): string[] {
  const roles = readClaimValues(payload, [
    'role',
    'roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ])

  return Array.from(new Set(roles.map(normalizeRole).filter(Boolean)))
}

function toPersistedAuth(response: JwtResponse): PersistedAuth {
  const payload = decodeJwtPayload(response.jwt)
  const identityRoles = readRoleClaims(payload)

  return {
    jwt: response.jwt,
    refreshToken: response.refreshToken,
    firstName: response.firstName ?? readStringClaim(payload, ['given_name', 'firstname', 'firstName']),
    lastName: response.lastName ?? readStringClaim(payload, ['family_name', 'lastname', 'lastName']),
    userId: readStringClaim(payload, [
      'sub',
      'nameid',
      'uid',
      'userId',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    ]),
    role: identityRoles[0] ?? '',
    identityRoles,
  }
}

function parseStorage(): PersistedAuth | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAuth> & { token?: string }
    const parsedJwt = typeof parsed.jwt === 'string' ? parsed.jwt : parsed.token
    if (typeof parsedJwt === 'string' && typeof parsed.refreshToken === 'string') {
      const fallback = toPersistedAuth({ jwt: parsedJwt, refreshToken: parsed.refreshToken })
      const identityRoles = Array.isArray(parsed.identityRoles)
        ? parsed.identityRoles.map(normalizeRole).filter(Boolean)
        : fallback.identityRoles

      return {
        jwt: parsedJwt,
        refreshToken: parsed.refreshToken,
        firstName: typeof parsed.firstName === 'string' ? parsed.firstName : fallback.firstName,
        lastName: typeof parsed.lastName === 'string' ? parsed.lastName : fallback.lastName,
        userId: typeof parsed.userId === 'string' ? parsed.userId : fallback.userId,
        role: typeof parsed.role === 'string' ? normalizeRole(parsed.role) : (identityRoles[0] ?? fallback.role),
        identityRoles,
      }
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return null
}

function writeStorage(payload: PersistedAuth): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function clearStorage(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    jwt: null,
    refreshToken: null,
    firstName: null,
    lastName: null,
    userId: null,
    role: null,
    identityRoles: [],
    isHydrated: false,
    authError: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => Boolean(state.jwt && state.refreshToken),
    isAuthenticated: (state): boolean => Boolean(state.jwt && state.refreshToken),
    displayName: (state): string => `${state.firstName ?? ''} ${state.lastName ?? ''}`.trim(),
    isRoot: (state): boolean => state.identityRoles.includes(IDENTITY_ROLE.root),
    isGlobalAdmin: (state): boolean => state.identityRoles.includes(IDENTITY_ROLE.admin),
    isAdmin(): boolean {
      return this.isRoot
    },
  },

  actions: {
    initializeFromStorage(): void {
      if (this.isHydrated) {
        return
      }

      const restored = parseStorage()
      if (restored) {
        this.jwt = restored.jwt
        this.refreshToken = restored.refreshToken
        this.firstName = restored.firstName
        this.lastName = restored.lastName
        this.userId = restored.userId
        this.role = restored.role
        this.identityRoles = restored.identityRoles
      }

      this.isHydrated = true
    },

    setAuth(response: JwtResponse): void {
      const payload = toPersistedAuth(response)
      this.jwt = payload.jwt
      this.refreshToken = payload.refreshToken
      this.firstName = payload.firstName
      this.lastName = payload.lastName
      this.userId = payload.userId
      this.role = payload.role
      this.identityRoles = payload.identityRoles
      this.authError = null
      writeStorage(payload)
    },

    logout(): void {
      this.jwt = null
      this.refreshToken = null
      this.firstName = null
      this.lastName = null
      this.userId = null
      this.role = null
      this.identityRoles = []
      this.authError = null
      clearStorage()
    },

    async logoutUser(): Promise<void> {
      if (this.refreshToken) {
        try {
          await logout(this.refreshToken)
        } catch {
          // Always clear local auth state even if server logout fails.
        }
      }

      this.logout()
    },

    async loginUser(model: LoginModel): Promise<boolean> {
      try {
        const response = await login(model)
        this.setAuth(response)
        return true
      } catch (error) {
        this.authError = error instanceof Error ? error.message : 'Login failed.'
        return false
      }
    },

    async registerUser(model: RegisterModel): Promise<boolean> {
      try {
        const response = await register(model)
        this.setAuth(response)
        return true
      } catch (error) {
        this.authError = error instanceof Error ? error.message : 'Registration failed.'
        return false
      }
    },

    async refreshAccessToken(): Promise<boolean> {
      if (!this.jwt || !this.refreshToken) {
        this.logout()
        return false
      }

      try {
        const response = await refresh({
          jwt: this.jwt,
          refreshToken: this.refreshToken,
        })
        this.setAuth(response)
        return true
      } catch {
        this.logout()
        return false
      }
    },
  },
})

export type AuthStore = ReturnType<typeof useAuthStore>
