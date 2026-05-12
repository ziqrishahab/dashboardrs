import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import type { ReactNode } from 'react'
import type { AxiosResponse } from 'axios'

export type AuthUser = {
  id?: string
  name?: string
  username?: string
  email?: string
  phone?: string
  address?: string
  role?: string
  type?: 'admin' | 'user' | string
  [key: string]: unknown
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

const parseAuthResponse = (response: AxiosResponse<any>) => {
  const payload = response?.data ?? {}
  const data = payload.data ?? {}
  const accessToken: string | undefined = data.access_token || payload.token
  return { accessToken, data }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      // Try admin login first (username-based)
      const res = await axios.post('/api/v1/auth/admin/login', { username, password })
      const { accessToken, data } = parseAuthResponse(res)
      if (!accessToken || !data.admin) throw new Error('Invalid login response')
      const userData: AuthUser = { ...data.admin, type: 'admin' }
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(userData)
      return userData
    } catch (adminErr: any) {
      // Fallback to regular user login (email/phone-based)
      if (adminErr.response?.status === 401 || adminErr.response?.status === 400) {
        // Don't retry if already 401 from admin endpoint, try user endpoint
      }
      try {
        const res = await axios.post('/api/v1/auth/login', { email: username, password })
        const { accessToken, data } = parseAuthResponse(res)
        if (!accessToken || !data.user) throw new Error('Invalid login response')
        const userData: AuthUser = { ...data.user, type: 'user' }
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        setUser(userData)
        return userData
      } catch (userErr: any) {
        throw userErr
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
