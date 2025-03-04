<template>
  <article class="post-card" :class="{ expanded: showInModal }">
    <div class="post-header">
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
    </div>

    <!-- Imagen clickeable -->
    <router-link :to="`/post/${post.id}`" class="post-image-link">
      <img :src="getPostImage(post)" class="post-img" :alt="post.title" @error="handleImageError" />
    </router-link>

    <h2 class="post-title">{{ post.title }}</h2>
    <p class="post-description">{{ post.description }}</p>

    <div class="ingredients">
      <div class="ingredient-tags">
        <span v-for="(ingredient, idx) in post.ingredients" :key="idx" class="ingredient-tag">
          {{ ingredient.name }} - {{ ingredient.quantity }}
        </span>
      </div>
    </div>

    <p class="date">Date: {{ formatDate(post.created_at) }}</p>

    <div class="actions">
      <button @click="handleLike" :class="{ liked: likesStore.isLiked(post.id) }">
        <i class="fas fa-heart"></i>
        {{ likesStore.getLikeCount(post.id) }}
      </button>
      
      <button class="comment-button" @click="handleComments">
        <i class="fas fa-comment"></i>
        {{ commentsStore.getCommentCount(post.id) }}
      </button>

      <button @click="handleShare" class="share-button">
        <i class="fas fa-share"></i>
      </button>
    </div>
  </article>
</template>

<script>
import { API_BASE_URL, STORAGE_URL, DEFAULT_AVATAR_URL } from '../utils/globalConstants'
import { useCommentsStore } from '../stores/comments'
import { useLikesStore } from '../stores/likes'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    },
    showInModal: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      likesStore: useLikesStore(),
      commentsStore: useCommentsStore(),
      authStore: useAuthStore(),
      notificationStore: useNotificationStore()
    }
  },

  created() {
    this.likesStore.initializeLikes([this.post]);
    this.commentsStore.initializeComments([this.post]);
  },

  methods: {
    getPostImage(post) {
      return post.imagen && post.imagen.startsWith('http')
        ? post.imagen
        : `${STORAGE_URL}/${post.imagen}`
    },

    getInitials(name) {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    async handleLike() {
      if (!this.authStore.isAuthenticated) {
        this.notificationStore.showNotification('Debes iniciar sesión para dar like', 'error')
        return
      }

      try {
        await this.likesStore.toggleLike(this.post.id)
      } catch (error) {
        this.notificationStore.showNotification('Error al procesar el like', 'error')
      }
    },

    handleComments() {
      this.$emit('open-comments', this.post.id)
    },

    handleShare() {
      if (navigator.share) {
        navigator.share({
          title: "Recetagram",
          text: "¡Mira esta increíble receta en Recetagram!",
          url: window.location.href
        })
      } else {
        alert("La funcionalidad de compartir no está disponible en este navegador.")
      }
    },

    handleImageError(e) {
      e.target.src = 'ruta/a/tu/imagen/por/defecto.jpg'
    }
  }
}
</script>

<style scoped>
/* === Contenedor principal === */
.post-container {
  grid-area: var(--main-area);
  width: 100%;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  margin: auto;
  position: relative;
}

/* === Scroll y botones de navegación === */
.scroll-container {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-top: 20px;
  width: 100%;
  height: 100%;
  position: relative;
}

.scroll-button {
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background-color: var(--contrast-color);
  color: #FEFDF4;
  position: sticky;
  height: 600px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
}

.scroll-button.left { left: 0; }
.scroll-button.right { right: 0; }

/* === Publicaciones === */
.publicaciones {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  overflow-x: scroll;
  scrollbar-width: none;
  padding-bottom: 20px;
  flex: 1;
  scroll-behavior: smooth;
}

/* === Tarjeta de publicación (PostCard) === */
.post-card {
  background-color: var(--sombra-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: var(--text-color);
  min-width: calc(25% - 20px);
  max-width: calc(25% - 20px);
  flex-shrink: 0;
  height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.post-card.expanded {
  max-width: 800px;
  width: 100%;
}

.post-card:hover {
  transform: scale(1.02);
}

/* === Información de usuario === */
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.user-details {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 5px;
}

.avatar {
  width: 50px;
  height: 50px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.role-badge {
  background-color: var(--contrast-color);
  color: #FEFDF4;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  text-transform: capitalize;
}

/* === Contenido del post === */
.post-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
}

.post-title {
  font-size: 1.5em;
  margin: 10px 0;
}

.post-description {
  font-size: 1em;
  color: var(--text-secondary-color);
  margin-bottom: 10px;
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.ingredient-tag {
  background-color: #e9e9e9;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  color: #333;
}

/* === Footer === */
.date {
  font-size: 0.9em;
  color: gray;
  margin-top: auto;
}

/* === Acciones === */
.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 15px;
}

.actions button, .share-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: var(--contrast-color);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 5px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.actions button:hover, .share-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* === Media Queries === */
@media (max-width: 1500px) {
  .post-card {
    min-width: calc(33.33% - 20px);
    max-width: calc(33.33% - 20px);
  }
}

@media (max-width: 1200px) {
  .post-card {
    min-width: calc(50% - 20px);
    max-width: calc(50% - 20px);
  }
}

@media (max-width: 1000px) {
  .post-card {
    min-width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

@media (max-width: 600px) {
  .post-card {
    padding: 15px;
  }
}

</style> 