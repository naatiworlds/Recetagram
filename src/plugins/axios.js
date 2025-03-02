import axios from 'axios'

// Configuración base de axios
axios.defaults.baseURL = 'http://localhost:8000/api/v1'

// Interceptor para manejar errores
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Si el token expiró o es inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios
