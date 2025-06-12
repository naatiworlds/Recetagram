import { defineStore } from "pinia"
import { apiService } from "../services/api"

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    following: [],
    buffer: []
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
    addBuffer(action) {
      this.buffer.push(action)
    },

    removeBuffer(postId, type = 'like') {
      this.buffer = this.buffer.filter(
        a => !(a.post_id === postId && a.type === type)
      )
    },

    isInBuffer(postId, userId, type = 'like') {
      return this.buffer.some(
        a => a.type === type && a.post_id === postId && a.user_id === userId
      )
    },

    toggleLike(post, notificationStore) {
      const userId = this.user?.id
      if (!this.isAuthenticated || !userId) {
        notificationStore.show('Debes iniciar sesión para dar like', 'warning')
        return
      }

      const alreadyLikedInBackend = post.liked_by?.some(l => l.id === userId)

      // Buscar si hay un like o unlike en buffer
      const hasPendingLike = this.buffer.some(
        a => a.type === 'like' && a.post_id === post.id && a.user_id === userId
      )
      const hasPendingUnlike = this.buffer.some(
        a => a.type === 'unlike' && a.post_id === post.id && a.user_id === userId
      )

      // CASO 1: Ya existe en backend y usuario da unlike
      if (alreadyLikedInBackend && !hasPendingUnlike) {
        this.buffer.push({ type: 'unlike', post_id: post.id, user_id: userId })
        post.likes_count--
        notificationStore.show('Like eliminado correctamente', 'success')
        return
      }

      // CASO 2: Usuario ya puso un unlike pendiente → lo cancela (vuelve al estado backend)
      if (hasPendingUnlike) {
        this.buffer = this.buffer.filter(
          a => !(a.type === 'unlike' && a.post_id === post.id && a.user_id === userId)
        )
        post.likes_count++
        notificationStore.show('Like restaurado', 'success')
        return
      }

      // CASO 3: No estaba en backend → se agrega like (nuevo like local)
      if (!alreadyLikedInBackend && !hasPendingLike) {
        this.buffer.push({ type: 'like', post_id: post.id, user_id: userId })
        post.likes_count++
        notificationStore.show('Like agregado correctamente', 'success')
        return
      }

      // CASO 4: Ya hay like pendiente → se cancela
      if (hasPendingLike) {
        this.buffer = this.buffer.filter(
          a => !(a.type === 'like' && a.post_id === post.id && a.user_id === userId)
        )
        post.likes_count--
        notificationStore.show('Like cancelado', 'success')
        return
      }
    },
    addCommentToBuffer(postId, content) {
      const userId = this.user?.id;
      if (!this.isAuthenticated || !userId) return;

      // Si ya hay un comentario pendiente para este post y usuario, lo reemplaza (edición local)
      const existingIndex = this.buffer.findIndex(
        a => a.type === 'comment' && a.post_id === postId && a.user_id === userId
      );
      if (existingIndex !== -1) {
        this.buffer[existingIndex].content = content;
      } else {
        this.buffer.push({
          type: 'comment',
          post_id: postId,
          user_id: userId,
          content,
          temp_id: Date.now() // Para identificarlo localmente si quieres
        });
      }
    },

    removeCommentFromBuffer(postId, userId) {
      this.buffer = this.buffer.filter(
        a => !(a.type === 'comment' && a.post_id === postId && a.user_id === userId)
      );
    },
    editCommentInBuffer(postId, commentId, content) {
      const userId = this.user?.id;
      if (!this.isAuthenticated || !userId) return;
      const idx = this.buffer.findIndex(
        a => a.type === 'edit' && a.post_id === postId && a.comment_id === commentId && a.user_id === userId
      );
      if (idx !== -1) {
        this.buffer[idx].content = content;
      } else {
        this.buffer.push({
          type: 'edit',
          post_id: postId,
          comment_id: commentId,
          user_id: userId,
          content
        });
      }
    },

    deleteCommentInBuffer(postId, commentId) {
      const userId = this.user?.id;
      if (!this.isAuthenticated || !userId) return;
      // Elimina cualquier acción pendiente de ese comentario y añade la de borrado
      this.buffer = this.buffer.filter(
        a => !(a.comment_id === commentId && a.post_id === postId && a.user_id === userId)
      );
      this.buffer.push({
        type: 'delete',
        post_id: postId,
        comment_id: commentId,
        user_id: userId
      });
    },
    addFollowToBuffer(targetUserId) {
      const userId = this.user?.id;
      if (!this.isAuthenticated || !userId) return;
      // Evita duplicados
      if (!this.buffer.some(a => a.type === 'follow' && a.target_user_id === targetUserId && a.user_id === userId)) {
        this.buffer.push({
          type: 'follow',
          user_id: userId,
          target_user_id: targetUserId
        });
      }
    },

    removeFollowFromBuffer(targetUserId) {
      const userId = this.user?.id;
      if (!this.isAuthenticated || !userId) return;
      // Evita duplicados
      if (!this.buffer.some(a => a.type === 'unfollow' && a.target_user_id === targetUserId && a.user_id === userId)) {
        this.buffer.push({
          type: 'unfollow',
          user_id: userId,
          target_user_id: targetUserId
        });
      }
    },

    // Para cancelar una acción pendiente (opcional)
    cancelFollowBuffer(targetUserId, type = 'follow') {
      const userId = this.user?.id;
      this.buffer = this.buffer.filter(
        a => !(a.type === type && a.target_user_id === targetUserId && a.user_id === userId)
      );
    },
  }
})