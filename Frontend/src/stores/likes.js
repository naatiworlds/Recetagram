import { defineStore } from 'pinia'
import { API_BASE_URL } from '../utils/globalConstants'
import axios from 'axios'

export const useLikesStore = defineStore('likes', {
  state: () => ({
    likeCounts: {},
    likedPosts: new Set(),
    isLoading: false,
    error: null
  }),

  getters: {
    getLikeCount: (state) => (postId) => {
      return state.likeCounts[postId] || 0
    },
    isLiked: (state) => (postId) => {
      return state.likedPosts.has(postId)
    }
  },

  actions: {
    async fetchLikeCount(postId) {
      if (!postId) return 0
      
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}`)
        
        if (response.data?.data) {
          const post = response.data.data
          this.likeCounts[postId] = post.likes_count || 0
          
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.id
          const hasLiked = post.liked_by?.some(user => user.id === currentUserId)
          
          if (hasLiked) {
            this.likedPosts.add(postId)
          } else {
            this.likedPosts.delete(postId)
          }

          return this.likeCounts[postId]
        }
        return 0
      } catch (error) {
        throw new Error(`Error al obtener likes: ${error.message}`)
      }
    },

    initializeLikes(posts) {
      posts.forEach(post => {
        // Inicializar el contador de likes
        this.likeCounts[post.id] = post.likes_count || 0
        
        // Verificar si el usuario actual ha dado like
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id
        const hasLiked = post.liked_by?.some(user => user.id === currentUserId)
        
        if (hasLiked) {
          this.likedPosts.add(post.id)
        } else {
          this.likedPosts.delete(post.id)
        }
      })
    },

    async toggleLike(postId) {
      if (!postId) throw new Error('Post ID is required')

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No authentication token found')

        const response = await axios.post(`${API_BASE_URL}/posts/${postId}/like`, 
          null, // enviamos null en lugar de objeto vacío
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        )

        // Actualizar el estado basado en la respuesta
        if (response.data?.status === 'success' || response.status === 200) {
          const isCurrentlyLiked = this.likedPosts.has(postId)
          if (isCurrentlyLiked) {
            this.likedPosts.delete(postId)
            this.likeCounts[postId] = Math.max(0, (this.likeCounts[postId] || 1) - 1)
          } else {
            this.likedPosts.add(postId)
            this.likeCounts[postId] = (this.likeCounts[postId] || 0) + 1
          }
          return this.likeCounts[postId]
        }
        
        throw new Error(response.data?.message || 'Error al procesar el like')
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al procesar el like')
      }
    }
  }
}) 