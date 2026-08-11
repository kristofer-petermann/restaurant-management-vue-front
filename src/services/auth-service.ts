import axios from 'axios'
import { API_BASE_URL } from './api-config'
import type {
  JwtResponse,
  LoginModel,
  MessageResponse,
  RefreshTokenModel,
  RegisterModel,
} from '@/types/auth'

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function login(model: LoginModel, expiresInSeconds?: number): Promise<JwtResponse> {
  const response = await authClient.post<JwtResponse>('/api/v1/identity/Account/Login', model, {
    params: expiresInSeconds ? { expiresInSeconds } : undefined,
  })

  return response.data
}

export async function register(
  model: RegisterModel,
  expiresInSeconds?: number,
): Promise<JwtResponse> {
  const response = await authClient.post<JwtResponse>('/api/v1/identity/Account/Register', model, {
    params: expiresInSeconds ? { expiresInSeconds } : undefined,
  })

  return response.data
}

export async function refresh(model: RefreshTokenModel, expiresInSeconds?: number): Promise<JwtResponse> {
  const response = await authClient.post<JwtResponse>('/api/v1/identity/Account/RefreshTokenData', model, {
    params: expiresInSeconds ? { expiresInSeconds } : undefined,
  })

  return response.data
}

export async function logout(refreshToken: string): Promise<MessageResponse> {
  const response = await authClient.post<MessageResponse>('/api/v1/identity/Account/Logout', {
    refreshToken,
  })

  return response.data
}
