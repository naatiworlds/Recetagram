<template>
  <section v-if="post" class="post-detail">
    <div class="post-content">
      <!-- Header con avatar y nombre -->
      <div class="user-info">
        <div class="avatar">
          <span class="avatar-text">{{ getInitials(post.user?.name) }}</span>
        </div>
        <div class="user-details">
          <h3>{{ post.user?.name }}</h3>
          <span v-if="post.user?.role" class="role-badge">
            {{ post.user.role }}
          </span>
        </div>
      </div>

      <!-- Imagen del post -->
      <div class="post-image-container">
        <img :src="getPostImage(post)" class="post-img" :alt="post.title" />
      </div>

      <!-- Título y descripción -->
      <h2 class="post-title">{{ post.title }}</h2>
      <p class="post-description">{{ post.description }}</p>

      <!-- Tags/Ingredientes -->
      <div class="tags-container">
        <span v-for="(ingredient, index) in post.ingredients" 
              :key="index" 
              class="tag">
          {{ ingredient.name }} - {{ ingredient.quantity }}
        </span>
      </div>

      <!-- Fecha y acciones -->
      <div class="post-footer">
        <span class="date">Date: {{ formatDate(post.created_at) }}</span>
        <div class="actions">
          <button @click="handleLike" :class="{ liked: isLiked }">
            <i class="fas fa-heart"></i>
            {{ likeCount }}
          </button>
          <button class="comment-button" @click="openComments">
            <i class="fas fa-comment"></i>
            {{ commentsStore.getCommentsCountForPost(post.id) }}
          </button>
          <button class="share-button" @click="handleShare">
            <i class="fas fa-share"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de comentarios -->
    <CommentModal 
      :is-open="showComments"
      :post-id="post.id"
      @close="closeComments"
    />
  </section>
  <section v-else class="post-detail loading">
    <div class="post-content">
      <p>Cargando post...</p>
    </div>
  </section>
</template>

<script>
import { API_BASE_URL, STORAGE_URL, DEFAULT_AVATAR_URL } from '../utils/globalConstants'
import CommentModal from '../components/CommentModal.vue'
import { useCommentsStore } from '../stores/comments'

export default {
  name: 'PostDetail',
  components: {
    CommentModal
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      post: null,
      likeCount: 0,
      isLiked: false,
      showComments: false,
      commentsStore: useCommentsStore()
    }
  },
  async created() {
    await this.fetchPost()
    if (this.post) {
      await this.commentsStore.fetchCommentCount(this.post.id)
    }
  },
  mounted() {
    // Verificar si debemos mostrar los comentarios al cargar
    if (this.$route.query.showComments) {
      this.showComments = true
    }
  },
  methods: {
    async fetchPost() {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${this.id}`)
        const data = await response.json()
        this.post = data.data
        this.likeCount = this.post.likes_count || 0
      } catch (error) {
        console.error('Error fetching post:', error)
      }
    },
    getProfileImage(post) {
      return post.user && post.user.avatar
        ? `${STORAGE_URL}/${post.user.avatar}`
        : `${DEFAULT_AVATAR_URL}/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`
    },
    getPostImage(post) {
      return post.imagen && post.imagen.startsWith('http')
        ? post.imagen
        : `${STORAGE_URL}/${post.imagen}`
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getInitials(name) {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    },
    async openComments() {
      this.showComments = true
      await this.commentsStore.fetchComments(this.post.id)
    },
    closeComments() {
      this.showComments = false
      // Actualizar la URL sin el parámetro showComments
      this.$router.replace({ query: {} })
    }
  },
  watch: {
    // Observar cambios en la ruta para abrir/cerrar comentarios
    '$route.query.showComments'(newVal) {
      this.showComments = Boolean(newVal)
    }
  }
}
</script>

<style scoped>
.post-detail {
  grid-area: var(--main-area);
  background-color: var(--secundary-color);
  border-radius: 10px;
  width: 600px;
  margin: 50px auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.role-badge {
  background-color: var(--contrast-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  text-transform: capitalize;
}

.post-image-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.post-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
  background-color: transparent;
}

.post-title {
  font-size: 1.2em;
  color: var(--text-color-important);
  margin: 10px 0 5px 0;
}

.post-description {
  font-size: 0.9em;
  color: var(--text-color);
  margin-bottom: 15px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background-color: white;
  color: var(--text-color-important);
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.9em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.date {
  font-size: 0.9em;
  color: var(--text-color);
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  background-color: var(--contrast-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 0.9em;
}

.actions button:hover {
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .post-detail {
    width: 90%;
  }
  
  .post-img {
    height: 350px;
  }
}

@media (max-width: 480px) {
  .post-detail {
    width: 95%;
    margin: 20px auto;
  }
  
  .post-img {
    height: 300px;
  }
}
</style> 