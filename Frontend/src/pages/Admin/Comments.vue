<template>
  <div class="admin-page">
    <h2>Gestión de Comentarios</h2>
    
    <div class="admin-filters">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar comentarios..." 
        class="search-input"
      />
      <select v-model="postFilter" class="filter-select">
        <option value="">Todos los posts</option>
        <option v-for="post in uniquePosts" :key="post.id" :value="post.id">
          {{ post.title }}
        </option>
      </select>
    </div>
    
    <div v-if="loading" class="loading-message">
      <p>Cargando comentarios...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchComments" class="btn-primary">
        <i class="fas fa-sync"></i> Reintentar
      </button>
    </div>
    
    <div v-else-if="filteredComments.length === 0" class="empty-message">
      <p v-if="searchTerm || postFilter">No se encontraron comentarios con los filtros actuales.</p>
      <p v-else>No hay comentarios disponibles.</p>
    </div>
    
    <div v-else class="admin-cards-container">
      <div v-for="comment in filteredComments" :key="comment.id" class="admin-card">
        <div class="card-header">
          <div class="comment-avatar">
            <i class="fas fa-comment"></i>
          </div>
          <h3>Comentario #{{ comment.id }}</h3>
        </div>
        
        <div class="card-body">
          <div class="card-field">
            <span class="field-label">Autor:</span>
            <span class="field-value">{{ comment.user?.name || 'Desconocido' }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Post:</span>
            <span class="field-value">{{ comment.post?.title || 'Desconocido' }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Contenido:</span>
            <span class="field-value comment-content">{{ comment.content }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Fecha:</span>
            <span class="field-value">{{ formatDate(comment.created_at) }}</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button @click="viewPost(comment.post_id)" class="btn-view">
            <i class="fas fa-eye"></i> Ver Post
          </button>
          <button @click="deleteComment(comment.id, comment.post_id)" class="btn-error">
            <i class="fas fa-trash"></i> Borrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { apiService } from '../../services/api'

export default {
  name: 'CommentsManagement',
  setup() {
    const comments = ref([])
    const searchTerm = ref('')
    const postFilter = ref('')
    const loading = ref(true)
    const error = ref(null)
    const notificationStore = useNotificationStore()

    const filteredComments = computed(() => {
      return comments.value.filter(comment => {
        const matchesSearch = comment.content.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                            (comment.user?.name || '').toLowerCase().includes(searchTerm.value.toLowerCase())
        const matchesPost = !postFilter.value || comment.post_id.toString() === postFilter.value.toString()
        return matchesSearch && matchesPost
      })
    })

    const uniquePosts = computed(() => {
      const postsMap = new Map()
      comments.value.forEach(comment => {
        if (comment.post && !postsMap.has(comment.post.id)) {
          postsMap.set(comment.post.id, comment.post)
        }
      })
      return Array.from(postsMap.values())
    })

    const fetchComments = async () => {
      loading.value = true
      error.value = null
      
      try {
        const { data } = await apiService.getComments()
        comments.value = data.data || []
        console.log('Comentarios cargados:', comments.value)
      } catch (err) {
        console.error('Error al cargar comentarios:', err)
        error.value = 'No se pudieron cargar los comentarios. Por favor, inténtalo de nuevo más tarde.'
        notificationStore.showNotification('Error al cargar comentarios', 'error')
      } finally {
        loading.value = false
      }
    }

    const deleteComment = async (commentId, postId) => {
      if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return
      
      try {
        await apiService.deleteComment(postId, commentId)
        comments.value = comments.value.filter(comment => comment.id !== commentId)
        notificationStore.showNotification('Comentario eliminado con éxito', 'success')
      } catch (err) {
        console.error('Error al eliminar comentario:', err)
        notificationStore.showNotification('Error al eliminar comentario', 'error')
      }
    }

    const viewPost = (postId) => {
      window.location.href = `/post/${postId}`
    }

    const formatDate = (date) => {
      if (!date) return 'Fecha desconocida'
      
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Cargar comentarios al montar el componente
    fetchComments()

    return {
      comments,
      searchTerm,
      postFilter,
      loading,
      error,
      filteredComments,
      uniquePosts,
      fetchComments,
      deleteComment,
      viewPost,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-page {
  width: 100%;
  padding: var(--espaciado);
  overflow-x: hidden;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaciado);
  margin-bottom: var(--espaciado);
}

.admin-filters input,
.admin-filters select {
  flex: 1;
  min-width: 200px;
  padding: calc(var(--espaciado) / 2);
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background-color: var(--complementary-color);
  color: var(--text-color);
}

/* Estilos para las tarjetas */
.admin-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.admin-card {
  background-color: var(--secundary-color);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.comment-avatar {
  width: 50px;
  height: 50px;
  background-color: var(--contrast-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.card-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
}

.card-body {
  padding: 15px;
  background-color: #ffd98033;
  flex: 1;
}

.card-field {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.field-label {
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 3px;
}

.field-value {
  color: var(--text-color);
  word-break: break-word;
}

.comment-content {
  font-style: italic;
  line-height: 1.4;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-top: 5px;
}

.card-actions {
  display: flex;
  padding: 10px;
  gap: 10px;
  background-color: #ffd98033;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.card-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-color-important);
}

.btn-error {
  background-color: #ff5252;
  color: white;
}

.btn-view {
  background-color: var(--contrast-color);
  color: white;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }

  .admin-filters {
    flex-direction: column;
  }

  .admin-filters input,
  .admin-filters select {
    width: 100%;
    max-width: none;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .admin-cards-container {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .admin-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 30px;
  background-color: var(--secundary-color);
  border-radius: 10px;
  margin-top: 20px;
}

.error-message {
  color: #ff5252;
}

.error-message button {
  margin-top: 15px;
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: var(--text-color-important);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style> 