export const IDENTITY_ROLE = {
  user: 'user',
  admin: 'admin',
  root: 'root',
} as const

export const RESTAURANT_USER_ROLE = {
  normal: 0,
  admin: 1,
} as const

export function normalizeRole(value: string): string {
  return value.trim().toLowerCase()
}
