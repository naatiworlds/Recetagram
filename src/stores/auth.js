import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from '../utils/globalConstants'

const API_URL = "http://localhost:8000/api/v1";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    initializeAuth() {
      if (this.isInitialized) return;

      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          this.token = token;
          this.user = JSON.parse(savedUser);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        this.isInitialized = true;
      }
    },

    async getUserProfile() {
      try {
        // Verificar que tenemos un token
        if (!this.token) {
          throw new Error("No hay token de autenticación");
        }

        console.log("Haciendo petición con token:", this.token); // Debug del token

        const response = await axios.get("/api/v1/me", {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json", // Aseguramos que queremos JSON
            "Content-Type": "application/json",
          },
        });

        console.log("Respuesta completa:", response.data);

        if (response.data && response.data.data) {
          return response.data.data;
        }

        throw new Error("Formato de respuesta inválido");
      } catch (error) {
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          // que cae fuera del rango 2xx
          console.error("Error de respuesta:", error.response.data);
          console.error("Status:", error.response.status);
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error("Error de petición:", error.request);
        } else {
          // Algo sucedió al configurar la petición que provocó un error
          console.error("Error:", error.message);
        }
        throw error;
      }
    },

    async login(email, password) {
      try {
        console.log('URL de login:', `${API_BASE_URL}/login`)
        console.log('Datos enviados:', { email, password })
        
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        console.log('Respuesta completa:', response)
        console.log('Datos de respuesta:', response.data)

        // Verificar la estructura de la respuesta
        if (response.data.status === 'success' && response.data.data) {
          // Asumiendo que el token y el usuario están dentro de data
          const { token, user } = response.data.data

          if (!token) {
            throw new Error('No se recibió token del servidor')
          }

          this.token = token
          this.user = user
          
          // Configurar axios para futuras peticiones
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          return response.data
        } else {
          console.error('Respuesta inesperada:', response.data)
          throw new Error('Formato de respuesta inválido')
        }
      } catch (error) {
        console.error('Error completo:', error)
        console.error('Detalles del error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        if (error.response?.status === 401) {
          throw new Error('Email o contraseña incorrectos')
        }
        
        throw new Error(error.response?.data?.message || error.message || 'Error al iniciar sesión')
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async register(userData) {
      try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    async updateProfile(userData) {
      try {
        if (!this.user?.id) {
          throw new Error('No se encontró el ID del usuario')
        }

        const response = await axios.put(`${API_URL}/users/${this.user.id}`, userData, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.data) {
          const updatedUser = { ...this.user, ...userData }
          this.user = updatedUser
          localStorage.setItem('user', JSON.stringify(updatedUser))
          return updatedUser
        } else {
          throw new Error('No se recibieron datos actualizados del usuario')
        }
      } catch (error) {
        console.error('Error en updateProfile:', error)
        if (error.message?.includes('successfully')) {
          const updatedUser = { ...this.user, ...userData }
          this.user = updatedUser
          localStorage.setItem('user', JSON.stringify(updatedUser))
          return updatedUser
        }
        throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
      }
    },

    async deleteAccount() {
      try {
        if (!this.user?.id) {
          throw new Error('No se encontró el ID del usuario')
        }

        await axios.delete(`${API_URL}/users/${this.user.id}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          }
        })

        // Limpiar datos del usuario
        this.logout()
        return true
      } catch (error) {
        console.error('Error al eliminar cuenta:', error)
        throw new Error(error.response?.data?.message || 'Error al eliminar la cuenta')
      }
    },
  },
});
