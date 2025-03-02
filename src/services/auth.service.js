import axios from 'axios'

const API_URL = 'YOUR_API_URL'

export const authService = {
  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    })
    return response.data
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  }
}

// Configurar interceptor para añadir el token a las peticiones
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
