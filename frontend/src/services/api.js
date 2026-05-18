import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

// Attach JWT automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401/403 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const isAdmin = localStorage.getItem('userRole') === 'admin'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      window.location.href = isAdmin ? '/admin/login' : '/login'
    }
    return Promise.reject(err)
  }
)

export default api
