<template>
  <div class="admin-page">
    <h2>Gestión de Posts</h2>
    
    <div class="admin-filters">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar posts..." 
        class="search-input"
      />
      <input 
        type="text" 
        v-model="authorFilter" 
        placeholder="Filtrar por autor..." 
        class="search-input"
      />
      <select v-model="dateFilter" class="filter-select">
        <option value="">Todas las fechas</option>
        <option value="today">Hoy</option>
        <option value="week">Esta semana</option>
        <option value="month">Este mes</option>
        <option value="year">Este año</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading-message">
      <p>Cargando posts...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchPosts" class="btn-primary">
        <i class="fas fa-sync"></i> Reintentar
      </button>
    </div>
    
    <div v-else-if="filteredPosts.length === 0" class="empty-message">
      <p v-if="searchTerm || authorFilter || dateFilter">No se encontraron posts con los filtros actuales.</p>
      <p v-else>No hay posts disponibles.</p>
    </div>
    
    <div v-else class="admin-cards-container">
      <div v-for="post in filteredPosts" :key="post.id" class="admin-card">
        <div class="card-header">
          <div class="post-avatar">
            <i class="fas fa-utensils"></i>
          </div>
          <h3>{{ post.title }}</h3>
        </div>
        
        <!-- Imagen del post -->
        <div class="post-image-container">
          <img 
            :src="getPostImage(post)" 
            class="post-img" 
            :alt="post.title" 
            @error="handleImageError"
          />
        </div>
        
        <div class="card-body">
          <div class="card-field">
            <span class="field-label">Autor:</span>
            <span class="field-value">{{ post.user?.name || 'Desconocido' }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Rol:</span>
            <span class="field-value role-badge" :class="post.user?.role || 'user'">
              {{ post.user?.role === 'admin' ? 'moderator' : (post.user?.role || 'user') }}
            </span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Descripción:</span>
            <span class="field-value description">{{ truncateText(post.description, 100) }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Likes:</span>
            <span class="field-value">{{ post.likes_count || 0 }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Comentarios:</span>
            <span class="field-value">{{ post.comments_count || 0 }}</span>
          </div>
          
          <div class="card-field">
            <span class="field-label">Fecha de publicación:</span>
            <span class="field-value">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button @click="editPost(post)" class="btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button @click="deletePost(post.id)" class="btn-error">
            <i class="fas fa-trash"></i> Borrar
          </button>
          <button @click="viewPost(post)" class="btn-view">
            <i class="fas fa-eye"></i> Ver Post
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
import { STORAGE_URL } from '../../utils/globalConstants'

export default {
  name: 'PostsManagement',
  setup() {
    const posts = ref([])
    const searchTerm = ref('')
    const authorFilter = ref('')
    const dateFilter = ref('')
    const loading = ref(true)
    const error = ref(null)
    const notificationStore = useNotificationStore()

    const filteredPosts = computed(() => {
      return posts.value.filter(post => {
        // Filtro por título o descripción
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                            post.description.toLowerCase().includes(searchTerm.value.toLowerCase())
        
        // Filtro por autor
        const matchesAuthor = !authorFilter.value || 
                            (post.user?.name || '').toLowerCase().includes(authorFilter.value.toLowerCase())
        
        // Filtro por fecha
        const matchesDate = !dateFilter.value || isWithinDateRange(post.created_at, dateFilter.value)
        
        return matchesSearch && matchesAuthor && matchesDate
      })
    })

    const isWithinDateRange = (dateString, range) => {
      if (!dateString) return false
      
      const postDate = new Date(dateString)
      const now = new Date()
      
      switch (range) {
        case 'today':
          return postDate.toDateString() === now.toDateString()
        
        case 'week': {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)
          return postDate >= weekStart
        }
        
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          return postDate >= monthStart
        }
        
        case 'year': {
          const yearStart = new Date(now.getFullYear(), 0, 1)
          return postDate >= yearStart
        }
        
        default:
          return true
      }
    }

    const fetchPosts = async () => {
      loading.value = true
      error.value = null
      
      try {
        const { data } = await apiService.getPosts()
        posts.value = data.data || []
        console.log('Posts cargados:', posts.value)
      } catch (err) {
        console.error('Error al cargar posts:', err)
        error.value = 'No se pudieron cargar los posts. Por favor, inténtalo de nuevo más tarde.'
        notificationStore.showNotification('Error al cargar posts', 'error')
      } finally {
        loading.value = false
      }
    }

    const deletePost = async (postId) => {
      if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return
      
      try {
        await apiService.deletePost(postId)
        posts.value = posts.value.filter(post => post.id !== postId)
        notificationStore.showNotification('Post eliminado con éxito', 'success')
      } catch (err) {
        console.error('Error al eliminar post:', err)
        notificationStore.showNotification('Error al eliminar post', 'error')
      }
    }

    const editPost = (post) => {
      window.location.href = `/posts/${post.id}/edit`
    }

    const viewPost = (post) => {
      window.location.href = `/post/${post.id}`
    }

    const formatDate = (date) => {
      if (!date) return 'Fecha desconocida'
      
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
    
    const getPostImage = (post) => {
      return post.imagen && post.imagen.startsWith('http')
        ? post.imagen
        : `${STORAGE_URL}/${post.imagen}`
    }
    
    const handleImageError = (e) => {
      e.target.src = '/img/default-post.jpg'
    }

    // Cargar posts al montar el componente
    fetchPosts()

    return {
      posts,
      searchTerm,
      authorFilter,
      dateFilter,
      loading,
      error,
      filteredPosts,
      fetchPosts,
      deletePost,
      editPost,
      viewPost,
      formatDate,
      truncateText,
      getPostImage,
      handleImageError
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

.post-avatar {
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
  font-size: 1.2rem;
  font-weight: 600;
}

/* Estilos para la imagen del post */
.post-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.post-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-img:hover {
  transform: scale(1.05);
}

.card-body {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-weight: 600;
  color: var(--text-color-muted);
  font-size: 0.9rem;
}

.field-value {
  color: var(--text-color);
}

.description {
  font-style: italic;
  line-height: 1.4;
}

/* Estilos para la insignia de rol */
.role-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  max-width: fit-content;
}

.role-badge.admin {
  background-color: #ff9800;
  color: white;
}

.role-badge.user {
  background-color: #2196F3;
  color: white;
}

.card-actions {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.card-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
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
</style> 