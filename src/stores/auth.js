import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api/v1'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },

  actions: {
    initializeAuth() {
      if (this.isInitialized) return;
      
      try {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (token && savedUser) {
          this.token = token
          this.user = JSON.parse(savedUser)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        this.isInitialized = true
      }
    },

    async login(email, password) {
      try {
        console.log('Enviando credenciales:', { email, password }) // Debug
        const response = await axios.post(`${API_URL}/login`, { email, password })
        console.log('Respuesta del servidor:', response.data) // Debug
        
        // Asegurarnos de que la respuesta tenga el formato correcto
        const { token, user } = response.data.data || response.data
        
        if (!token || !user) {
          throw new Error('Respuesta inválida del servidor')
        }

        // Guardar en localStorage primero
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Actualizar estado
        this.$patch({
          token,
          user,
          isInitialized: true
        })
        
        // Configurar axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { token, user }
      } catch (error) {
        console.error('Error en login:', error)
        throw error
      }
    },

    async register(userData) {
      try {
        const response = await axios.post(`${API_URL}/register`, userData)
        return response
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.$patch({
        user: null,
        token: null
      })
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    }
  }
})
