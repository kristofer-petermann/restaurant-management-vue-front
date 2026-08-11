import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './api-config'
import type { AuthStore } from '@/stores/auth-store'

const API_VERSION = '1.0'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

let authStoreInstance: AuthStore | null = null
let refreshPromise: Promise<boolean> | null = null

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function withApiVersion(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const url = config.url ?? ''
  if (!url.startsWith('/api/') || url.startsWith('/api/v1/')) {
    return config
  }

  config.params = {
    ...config.params,
    'api-version': config.params?.['api-version'] ?? API_VERSION,
  }

  return config
}

function withAuthHeader(config: InternalAxiosRequestConfig, token: string): InternalAxiosRequestConfig {
  config.headers.set('Authorization', `Bearer ${token}`)
  return config
}

export function setupApiInterceptors(store: AuthStore): void {
  authStoreInstance = store

  apiClient.interceptors.request.use((config) => {
    const versionedConfig = withApiVersion(config)
    const token = authStoreInstance?.jwt
    if (token) {
      return withAuthHeader(versionedConfig, token)
    }

    return versionedConfig
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config
      const statusCode = error.response?.status

      if (!authStoreInstance || !originalRequest || originalRequest._retry || statusCode !== 401) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = authStoreInstance.refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const refreshed = await refreshPromise
      if (!refreshed) {
        return Promise.reject(error)
      }

      return apiClient(originalRequest)
    },
  )
}
