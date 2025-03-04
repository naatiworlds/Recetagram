import { defineStore } from 'pinia'
import { API_BASE_URL } from '../utils/globalConstants'
import axios from 'axios'

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [],
    commentCounts: {}, // Objeto para almacenar el contador de cada post
    isLoading: false,
    error: null
  }),

  getters: {
    getCommentsCountForPost: (state) => (postId) => {
      return state.commentCounts[postId] || 0
    }
  },

  actions: {
    async fetchCommentCount(postId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        this.commentCounts[postId] = response.data.data.length || 0
        return this.commentCounts[postId]
      } catch (error) {
        console.error('Error fetching comment count:', error)
        return 0
      }
    },

    async fetchComments(postId) {
      this.isLoading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        this.comments = response.data.data || []
        this.commentCounts[postId] = this.comments.length
        return this.comments
      } catch (error) {
        console.error('Error fetching comments:', error)
        this.error = 'Error al cargar los comentarios'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createComment(postId, content) {
      try {
        const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, 
          { content },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
        this.comments.unshift(response.data.data)
        this.commentCounts[postId] = (this.commentCounts[postId] || 0) + 1
        return response.data.data
      } catch (error) {
        console.error('Error creating comment:', error)
        this.error = 'Error al crear el comentario'
        throw error
      }
    },

    async updateComment(postId, commentId, content) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
          { content },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
        const index = this.comments.findIndex(c => c.id === commentId)
        if (index !== -1) {
          this.comments[index] = response.data.data
        }
        return response.data.data
      } catch (error) {
        console.error('Error updating comment:', error)
        this.error = 'Error al actualizar el comentario'
        throw error
      }
    },

    async deleteComment(postId, commentId) {
      try {
        await axios.delete(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })
        this.comments = this.comments.filter(c => c.id !== commentId)
        this.commentCounts[postId] = Math.max(0, (this.commentCounts[postId] || 1) - 1)
      } catch (error) {
        console.error('Error deleting comment:', error)
        this.error = 'Error al eliminar el comentario'
        throw error
      }
    }
  }
}) 