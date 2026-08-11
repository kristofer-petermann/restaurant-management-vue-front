export interface LoginModel {
  email: string
  password: string
}

export interface RegisterModel {
  email: string
  password: string
  firstname: string
  lastname: string
}

export interface RefreshTokenModel {
  jwt: string
  refreshToken: string
}

export interface JwtResponse {
  jwt: string
  refreshToken: string
  firstName?: string
  lastName?: string
}

export interface MessageResponse {
  messages?: string[]
}

export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  [key: string]: unknown
}

export interface AuthState {
  jwt: string | null
  refreshToken: string | null
  firstName: string | null
  lastName: string | null
  userId: string | null
  role: string | null
  identityRoles: string[]
  isHydrated: boolean
  authError: string | null
}
