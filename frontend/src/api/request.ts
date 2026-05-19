import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

interface ApiError {
  code: string
  message: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: ApiError | null
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TIMEOUT: number = 10000

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ppo_lab_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { success, data: _data, error } = response.data
    if (!success) {
      const apiError: ApiError = error || { code: 'UNKNOWN_ERROR', message: '未知错误' }
      console.error(`[API Error] ${apiError.code}: ${apiError.message}`)
      return Promise.reject(apiError)
    }
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const errorMessages: Record<number, string> = {
        400: '请求参数错误',
        404: '请求资源不存在',
        422: '数据验证失败',
        500: '服务器内部错误',
      }
      const message = errorMessages[status] || `HTTP ${status} 错误`
      console.error(`[HTTP Error] ${status}: ${message}`)
      return Promise.reject({ code: `HTTP_${status}`, message })
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ code: 'TIMEOUT', message: '请求超时，请检查网络连接' })
    }
    return Promise.reject({ code: 'NETWORK_ERROR', message: '网络连接失败' })
  }
)

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config)
  return response.data.data as T
}

export { apiClient, request }
