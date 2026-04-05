<template>
  <div class="admin-page">
    <h2>Gestión de Posts</h2>

    <div class="admin-filters">
      <input v-model="searchTerm" placeholder="Buscar posts..." class="search-input" />
      <input v-model="authorFilter" placeholder="Filtrar por autor..." class="search-input" />
      <select v-model="dateFilter" class="filter-select">
        <option value="">Todas las fechas</option>
        <option value="today">Hoy</option>
        <option value="week">Esta semana</option>
        <option value="month">Este mes</option>
        <option value="year">Este año</option>
      </select>
    </div>

    <div v-if="loading" class="loading-message">Cargando posts...</div>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchPosts" class="btn-primary">Reintentar</button>
    </div>
    <div v-else-if="filteredPosts.length === 0" class="empty-message">No hay posts disponibles.</div>

    <div v-else class="admin-cards-container">
      <div v-for="post in filteredPosts" :key="post.id" class="admin-card">
        <div class="card-header">
          <div class="post-avatar"><i class="fas fa-utensils"></i></div>
          <h3>{{ post.title }}</h3>
        </div>
        <div class="post-image-container">
          <img :src="getPostImage(post)" class="post-img" :alt="post.title" @error="handleImageError" />
        </div>
        <div class="card-body">
          <div class="card-field">Autor: <span>{{ post.user?.name || 'Desconocido' }}</span></div>
          <div class="card-field">Rol: <span :class="post.user?.role || 'user'">{{ formatRole(post.user?.role) }}</span></div>
          <div class="card-field">Descripción: <span>{{ truncateText(post.description, 100) }}</span></div>
          <div class="card-field">Likes: <span>{{ post.likes_count || 0 }}</span></div>
          <div class="card-field">Comentarios: <span>{{ post.comments_count || 0 }}</span></div>
          <div class="card-field">Fecha: <span>{{ formatDate(post.created_at) }}</span></div>
        </div>
        <div class="card-actions">
          <button @click="editPost(post)" class="btn-primary">Editar</button>
          <button @click="deletePost(post.id)" class="btn-error">Borrar</button>
          <button @click="viewPost(post)" class="btn-view">Ver Post</button>
        </div>
      </div>
      <Crear v-if="showPostModal" :post-to-edit="postToEdit" @close="handleModalClose" />

    </div>
  </div>
</template>

<script>
import { apiService } from '../../services/api'
import { STORAGE_URL } from '../../utils/globalConstants'
import Crear from '../../components/Crear.vue'



export default {
  name: 'PostsManagement',
components: {
  Crear
},
  data() {
    return {
      posts: [],
      searchTerm: '',
      authorFilter: '',
      dateFilter: '',
      loading: true,
      error: null,
      showPostModal: false,
      postToEdit: null,
    }
  },

  computed: {
    filteredPosts() {
      return this.posts.filter(post => {
        const matchesSearch =
          post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(this.searchTerm.toLowerCase())

        const matchesAuthor =
          !this.authorFilter || post.user?.name?.toLowerCase().includes(this.authorFilter.toLowerCase())

        const matchesDate =
          !this.dateFilter || this.isWithinDateRange(post.created_at, this.dateFilter)

        return matchesSearch && matchesAuthor && matchesDate
      })
    }
  },

  methods: {
    async fetchPosts() {
      this.loading = true
      this.error = null
      try {
        const { data } = await apiService.getAllPosts()
        this.posts = data.data || []
      } catch {
        this.error = 'Error al cargar posts.'
      } finally {
        this.loading = false
      }
    },

    async deletePost(postId) {
      if (confirm('¿Eliminar este post?')) {
        try {
          await apiService.deletePost(postId)
          this.posts = this.posts.filter(post => post.id !== postId)
        } catch {
          alert('Error al eliminar post.')
        }
      }
    },

    editPost(post) {
  this.postToEdit = post;
  this.showPostModal = true;
},



    viewPost(post) {
      window.location.href = `/posts/${post.id}`
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    truncateText(text, maxLength) {
      return text?.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    getPostImage(post) {
      return post.imagen?.startsWith('http') ? post.imagen : `${STORAGE_URL}/${post.imagen}`
    },

    handleImageError(e) {
      e.target.src = '/img/default-post.jpg'
    },

    formatRole(role) {
      return role === 'admin' ? 'moderator' : (role || 'user')
    },

    isWithinDateRange(dateStr, filterType) {
      const created = new Date(dateStr)
      const today = new Date()
      const diffTime = today - created
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (filterType) {
        case 'today':
          return created.toDateString() === today.toDateString()
        case 'week':
          return diffDays < 7
        case 'month':
          return diffDays < 30
        case 'year':
          return diffDays < 365
        default:
          return true
      }
    },

        handleModalClose() {
            // Cerrar el modal
            this.showPostModal = false;
            this.postToEdit = null;
        },    
  },

  created() {
    this.fetchPosts()
  }
}
</script>


<style scoped>
.admin-page {
  width: 100%;
  padding: var(--espaciado);
  padding-bottom: 60px; /* Espacio adicional en la parte inferior */
  overflow-x: hidden;
  min-height: calc(100vh - var(--header-height) - 200px); /* Altura mínima considerando header y navegación */
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
    padding-bottom: 50px; /* Mantener espacio inferior en móviles */
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