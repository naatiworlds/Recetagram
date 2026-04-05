import { defineStore } from "pinia";
import { apiService } from '../services/api'
import { API_BASE_URL } from '../utils/globalConstants'

const API_URL = "http://localhost:8000/api/v1";

export const useAuthStore = defineStore("auth", {
  state: () => {
    console.log('[AuthStore] Inicializando estado')
    // Intentar recuperar y parsear el usuario de localStorage de manera segura
    let user = null;
    let token = localStorage.getItem('token');
    
    console.log('[AuthStore] Token en localStorage:', token ? 'Presente' : 'No encontrado')
    
    try {
      const savedUser = localStorage.getItem('user');
      console.log('[AuthStore] Usuario en localStorage:', savedUser ? 'Presente' : 'No encontrado')
      
      if (savedUser) {
        user = JSON.parse(savedUser);
        console.log('[AuthStore] Usuario parseado correctamente:', user ? user.name : 'Sin nombre')
      }
    } catch (e) {
      console.error('[AuthStore] Error al parsear datos de usuario:', e);
      localStorage.removeItem('user'); // Eliminar datos inválidos
    }

    return {
      user: user,
      token: token,
      isInitialized: false,
      authenticated: !!token
    };
  },

  getters: {
    isAuthenticated: (state) => {
      console.log('[AuthStore] isAuthenticated getter llamado, authenticated:', state.authenticated);
      return state.authenticated;
    },
  },

  actions: {
    initializeAuth() {
      console.log('[AuthStore] Iniciando initializeAuth, isInitialized:', this.isInitialized);
      if (this.isInitialized) {
        console.log('[AuthStore] Ya inicializado, saliendo');
        return;
      }

      try {
        // Primero, verificar si hay datos inválidos en localStorage y limpiarlos
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            JSON.parse(savedUser); // Intentar parsear para verificar si es válido
          }
        } catch (e) {
          console.error('[AuthStore] Datos de usuario inválidos en localStorage, limpiando:', e);
          localStorage.removeItem('user');
        }

        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        
        console.log('[AuthStore] Token recuperado:', token ? 'Presente' : 'No encontrado');
        console.log('[AuthStore] Usuario guardado:', savedUser ? 'Presente' : 'No encontrado');

        if (token) {
          this.token = token;
          this.authenticated = true;
          console.log('[AuthStore] Token establecido en el store, authenticated =', this.authenticated);
          
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              this.user = parsedUser;
              console.log('[AuthStore] Usuario establecido en el store:', parsedUser.name);
            } catch (e) {
              console.error('[AuthStore] Error al parsear datos de usuario durante inicialización:', e);
              localStorage.removeItem('user');
              // Intentar obtener el perfil del usuario
              this.getUserProfile().catch(error => {
                console.error('[AuthStore] No se pudo obtener el perfil después de error de parseo:', error);
                // No cerramos sesión automáticamente por errores 404
              });
            }
          } else {
            console.log('[AuthStore] No hay datos de usuario, intentando obtenerlos del servidor');
            // Si tenemos token pero no datos de usuario, intentamos obtenerlos
            this.getUserProfile().then(userData => {
              console.log('[AuthStore] Perfil de usuario obtenido:', userData);
              this.user = userData;
              localStorage.setItem('user', JSON.stringify(userData));
            }).catch(error => {
              console.error('[AuthStore] Error al obtener perfil de usuario:', error);
              // Solo cerrar sesión si es un error de autenticación (401)
              if (error.response?.status === 401) {
                console.warn('[AuthStore] Token inválido (401), cerrando sesión');
                this.logout();
              }
            });
          }
        } else {
          console.log('[AuthStore] No hay token, usuario no autenticado');
          this.authenticated = false;
        }
      } catch (e) {
        console.error('[AuthStore] Error durante la inicialización de autenticación:', e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.authenticated = false;
      } finally {
        this.isInitialized = true;
        console.log('[AuthStore] Inicialización completada, isInitialized:', this.isInitialized);
        console.log('[AuthStore] Estado de autenticación después de inicializar:', this.authenticated);
      }
    },

    async getUserProfile() {
      console.log('[AuthStore] Solicitando perfil de usuario');
      try {
        // Verificar que tenemos un token
        if (!this.token) {
          // Intentar obtener el token de localStorage si no está en el estado
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            console.log('[AuthStore] Token encontrado en localStorage, actualizando estado');
            this.token = storedToken;
            this.authenticated = true;
          } else {
            console.error('[AuthStore] No hay token de autenticación');
            throw new Error("No hay token de autenticación");
          }
        }

        console.log("[AuthStore] Haciendo petición con token:", this.token.substring(0, 10) + '...');

        const response = await apiService.getUserProfile();
        console.log("[AuthStore] Respuesta del perfil:", response.data);

        // La respuesta tiene formato { status, message, data }
        if (response && response.data && response.data.data) {
          // Actualizar el usuario en el estado y localStorage
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data;
        } else {
          console.error('[AuthStore] Formato de respuesta inesperado:', response.data);
          throw new Error("Formato de respuesta inválido");
        }
      } catch (error) {
        console.error('[AuthStore] Error en getUserProfile:', error);
        if (error.response) {
          console.error("[AuthStore] Error de respuesta:", error.response.data);
          console.error("[AuthStore] Status:", error.response.status);
        } else if (error.request) {
          console.error("[AuthStore] Error de petición:", error.request);
        } else {
          console.error("[AuthStore] Error:", error.message);
        }
        throw error;
      }
    },

    async login(email, password) {
      console.log('[AuthStore] Iniciando login para:', email);
      try {
        const response = await apiService.login({ email, password })
        console.log('[AuthStore] Login exitoso, respuesta:', response.data);
        
        // Procesar respuesta exitosa
        const { token, user } = response.data.data;
        
        console.log('[AuthStore] Token recibido:', token ? 'Presente' : 'No encontrado');
        console.log('[AuthStore] Usuario recibido:', user ? user.name : 'No encontrado');
        
        if (!token) {
          throw new Error('No se recibió token en la respuesta');
        }
        
        // Guardar token y datos de usuario
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        console.log('[AuthStore] Token y usuario guardados en localStorage');
        
        // Actualizar estado directamente
        this.token = token;
        this.user = user;
        this.authenticated = true;
        
        console.log('[AuthStore] Token y usuario establecidos en el store');
        console.log('[AuthStore] Estado después de login:', 
          this.authenticated ? 'Autenticado' : 'No autenticado', 
          'Token:', this.token ? 'Presente' : 'No encontrado');
        
        return response
      } catch (error) {
        console.error('[AuthStore] Error en login:', error);
        // Propagar el error para que el componente pueda manejarlo
        throw error
      }
    },

    logout() {
      console.log('[AuthStore] Cerrando sesión');
      
      // Actualizar estado directamente
      this.token = null;
      this.user = null;
      this.authenticated = false;
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.log('[AuthStore] Sesión cerrada, token y usuario eliminados');
    },

    async register(userData) {
      console.log('[AuthStore] Registrando nuevo usuario:', userData.email);
      try {
        const response = await apiService.register(userData);
        console.log('[AuthStore] Registro exitoso:', response.data);
        return response;
      } catch (error) {
        console.error('[AuthStore] Error en registro:', error);
        throw error;
      }
    },

    async updateProfile(data) {
      console.log('[AuthStore] Actualizando perfil para:', this.user?.name);
      const response = await apiService.updateProfile(data)
      console.log('[AuthStore] Perfil actualizado:', response.data);
      
      this.user = response.data;
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async deleteAccount() {
      console.log('[AuthStore] Eliminando cuenta');
      await apiService.deleteAccount()
      console.log('[AuthStore] Cuenta eliminada');
      this.logout()
    },

    setAuth(data) {
      console.log('[AuthStore] Estableciendo autenticación manualmente');
      
      this.token = data.token;
      this.user = data.user;
      this.authenticated = true;
      
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      console.log('[AuthStore] Autenticación establecida para:', this.user.name);
    },
  },
});
