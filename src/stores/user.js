import { defineStore } from "pinia"
import { apiService } from "../services/api"

export const useUserStore = defineStore('user', {
    state: () => ({
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: false,
      following: []
    }),
    
    getters: {
      isAdmin: (state) => state.user?.role === 'admin',
      currentUser: (state) => state.user,
    },
    
    actions: {
      async initializeAuth() {
        const token = localStorage.getItem('token')
        if (!token) return false
  
        try {
          this.token = token
          apiService.setAuthToken(token)
          const response = await apiService.getMe()
          
          if (response.data.status === 'success') {
            this.user = response.data.data
            this.isAuthenticated = true
            return true
          }
          return false
        } catch (error) {
          console.error('Error inicializando auth:', error)
          if (error.response?.status === 401) {
            this.clearAuth()
          }
          return false
        }
      },
      setUser(user) {
        this.user = user
        this.isAuthenticated = !!user
        localStorage.setItem('user', JSON.stringify(user))
      },
      setToken(token) {
        this.token = token
        this.isAuthenticated = true
        localStorage.setItem('token', token)
        localStorage.setItem('isAuthenticated', 'true')
        apiService.setAuthToken(token)
      },
      async logout() {
        try {
          if (this.token) {
            await apiService.logout()
          }
        } catch (error) {
          console.error('Error en logout:', error)
        } finally {
          this.clearAuth()
        }
      },
      clearAuth() {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
      },
    }
  })