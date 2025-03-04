<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
    <div class="comment-modal" :class="{ 'is-open': isOpen }">
      <div class="comment-header">
        <h3>Comentarios</h3>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="comments-container">
        <div v-if="commentsStore.comments.length === 0" class="no-comments">
          No hay comentarios aún
        </div>
        <div v-else class="comment-list">
          <div v-for="comment in commentsStore.comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <div class="comment-user">
                <div class="avatar">
                  <span class="avatar-text">{{ getInitials(comment.user?.name) }}</span>
                </div>
                <span class="user-name">{{ comment.user?.name }}</span>
              </div>
              <div class="comment-actions">
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                <div v-if="canModifyComment(comment)" class="action-buttons">
                  <button v-if="editingCommentId !== comment.id" @click="startEditing(comment)" class="action-button edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmDelete(comment)" class="action-button delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="editingCommentId === comment.id" class="edit-form">
              <textarea 
                v-model="editedContent" 
                rows="3"
                class="edit-textarea"
              ></textarea>
              <div class="edit-buttons">
                <button @click="saveEdit(comment)" :disabled="!editedContent.trim()">
                  Guardar
                </button>
                <button @click="cancelEdit" class="cancel-button">
                  Cancelar
                </button>
              </div>
            </div>
            <p v-else class="comment-text">{{ comment.content }}</p>
          </div>
        </div>
      </div>

      <div class="comment-form">
        <textarea 
          v-model="newComment" 
          placeholder="Escribe un comentario..."
          rows="3"
        ></textarea>
        <button @click="submitComment" :disabled="!newComment.trim()">
          <i class="fas fa-paper-plane"></i>
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { useCommentsStore } from '../stores/comments'

export default {
  name: 'CommentModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    postId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      newComment: '',
      editingCommentId: null,
      editedContent: '',
      authStore: useAuthStore(),
      notificationStore: useNotificationStore(),
      commentsStore: useCommentsStore()
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchComments()
      }
    }
  },
  methods: {
    async fetchComments() {
      try {
        await this.commentsStore.fetchComments(this.postId)
      } catch (error) {
        this.notificationStore.showNotification('Error al cargar los comentarios', 'error')
      }
    },

    async submitComment() {
      if (!this.authStore.isAuthenticated) {
        this.notificationStore.showNotification('Debes iniciar sesión para comentar', 'error')
        return
      }

      try {
        await this.commentsStore.createComment(this.postId, this.newComment)
        this.newComment = ''
        this.notificationStore.showNotification('Comentario publicado con éxito', 'success')
        this.$emit('comment-added')
      } catch (error) {
        this.notificationStore.showNotification('Error al publicar el comentario', 'error')
      }
    },

    canModifyComment(comment) {
      return this.authStore.isAuthenticated && 
             comment.user?.id === this.authStore.user?.id
    },

    startEditing(comment) {
      this.editingCommentId = comment.id
      this.editedContent = comment.content
    },

    async saveEdit(comment) {
      try {
        await this.commentsStore.updateComment(this.postId, comment.id, this.editedContent)
        this.editingCommentId = null
        this.editedContent = ''
        this.notificationStore.showNotification('Comentario actualizado con éxito', 'success')
      } catch (error) {
        this.notificationStore.showNotification('Error al actualizar el comentario', 'error')
      }
    },

    cancelEdit() {
      this.editingCommentId = null
      this.editedContent = ''
    },

    async confirmDelete(comment) {
      if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        try {
          await this.commentsStore.deleteComment(this.postId, comment.id)
          this.notificationStore.showNotification('Comentario eliminado con éxito', 'success')
        } catch (error) {
          this.notificationStore.showNotification('Error al eliminar el comentario', 'error')
        }
      }
    },

    closeModal() {
      this.$emit('close')
    },

    getInitials(name) {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 999;
}

.comment-modal {
  position: relative;
  width: 400px;
  height: 100vh;
  background-color: var(--secundary-color);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(100%);
  display: flex;
  flex-direction: column;
}

.comment-modal.is-open {
  transform: translateX(0);
}

.comment-header {
  padding: 20px;
  background-color: var(--primary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 20px;
  cursor: pointer;
}

.comments-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.comment {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--primary-color);
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

.comment-date {
  font-size: 0.8em;
  color: var(--text-color);
  opacity: 0.8;
}

.avatar {
  width: 35px;
  height: 35px;
  background-color: var(--contrast-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.comment-text {
  margin-top: 8px;
  color: var(--text-color);
  line-height: 1.4;
}

.comment-form {
  position: relative;
  padding: 20px;
  background-color: var(--primary-color);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-bottom: 10px;
  resize: none;
  background-color: var(--secundary-color);
  color: var(--text-color);
}

.comment-form button {
  background-color: var(--contrast-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.comment-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.6;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 1;
}

.action-button.edit:hover {
  color: #4CAF50;
}

.action-button.delete:hover {
  color: #f44336;
}

.edit-form {
  margin-top: 10px;
}

.edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  resize: vertical;
}

.edit-buttons {
  display: flex;
  gap: 8px;
}

.edit-buttons button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-buttons button:first-child {
  background-color: var(--contrast-color);
  color: white;
}

.edit-buttons .cancel-button {
  background-color: #f44336;
  color: white;
}

.edit-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .comment-modal {
    width: 100%;
  }
}
</style> 