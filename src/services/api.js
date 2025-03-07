import axios from 'axios'
import { API_BASE_URL } from '../utils/globalConstants'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para añadir el token a todas las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  console.log('[API Interceptor] Verificando token:', token ? 'Token presente' : 'Sin token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('[API Interceptor] Añadiendo token a la solicitud:', config.url)
  }
  return config
}, error => {
  console.error('[API Interceptor] Error en la solicitud:', error)
  return Promise.reject(error)
})

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => {
    console.log(`[API Response] Respuesta exitosa de ${response.config.url}:`, response.status)
    return response
  },
  error => {
    // Extraer información detallada del error
    const errorResponse = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    }
    
    console.error('[API Error]', errorResponse)
    
    // Si es un error de autenticación (401), limpiar el token y redirigir a login
    if (error.response?.status === 401) {
      console.warn('[API Error 401] Token inválido o expirado, redirigiendo a login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Si es un error de validación (422), formatea los mensajes de error
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors || {}
      const formattedErrors = Object.values(validationErrors).flat()
      error.validationErrors = validationErrors
      error.formattedMessage = formattedErrors.join(', ')
      console.warn('[API Error 422] Errores de validación:', validationErrors)
    }
    
    return Promise.reject(error)
  }
)

export const apiService = {
  // Posts
  getPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  
  // Comments
  getComments: async () => {
    try {
      console.log('[API] Solicitando todos los comentarios')
      
      // Primero obtenemos todos los posts
      const postsResponse = await api.get('/posts')
      const posts = postsResponse.data.data
      
      // Luego obtenemos los comentarios de cada post
      const commentsPromises = posts.map(post => 
        api.get(`/posts/${post.id}/comments`)
          .then(response => {
            // Añadimos información del post a cada comentario
            const comments = response.data.data || []
            return comments.map(comment => ({
              ...comment,
              post: {
                id: post.id,
                title: post.title
              }
            }))
          })
          .catch(error => {
            console.error(`[API] Error al obtener comentarios del post ${post.id}:`, error)
            return [] // Devolvemos array vacío si hay error
          })
      )
      
      // Esperamos a que se resuelvan todas las promesas
      const commentsArrays = await Promise.all(commentsPromises)
      
      // Aplanamos el array de arrays de comentarios
      const allComments = commentsArrays.flat()
      
      return {
        data: {
          status: 'success',
          message: 'Comentarios obtenidos con éxito',
          data: allComments
        }
      }
    } catch (error) {
      console.error('[API] Error al obtener todos los comentarios:', error)
      throw error
    }
  },
  getPostComments: (postId) => api.get(`/posts/${postId}/comments`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateComment: (postId, commentId, data) => api.put(`/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (postId, commentId) => {
    console.log(`[API] Eliminando comentario ${commentId} del post ${postId}`)
    return api.delete(`/posts/${postId}/comments/${commentId}`)
  },
  
  // Users
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Auth
  login: (credentials) => {
    console.log('[API] Intentando login con:', { email: credentials.email, password: '***' })
    return api.post('/login', credentials)
  },
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  getUserProfile: () => {
    console.log('[API] Solicitando perfil de usuario')
    return api.get('/me')
  },
  
  // Likes
  toggleLike: (postId) => api.post(`/posts/${postId}/likes`),
  
  // Profile
  updateProfile: (data) => api.put('/profile', data),
  deleteAccount: () => api.delete('/profile')
} 