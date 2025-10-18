<template>
  <article class="post-card" :class="{ expanded: showInModal }">
    <div class="post-header">
      <router-link :to="`/user/${post.user.id}`" class="username-link">
        <div class="user-info">
          <div class="avatar">
            <span class="avatar-text">{{ getInitials(post.user?.name) }}</span>
          </div>
          <div class="user-details">
            {{ post.user.name }}
            <span v-if="post.user?.role" class="role-badge">
              {{ post.user.role }}
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Imagen clickeable -->
    <router-link :to="postUrl" class="post-image-link">
      <img :src="getImageUrl(post.imagen)" class="post-img" :alt="post.title" @error="handleImageError" />
    </router-link>
    <div class="actions">
      <button @click="handleLike">
        <i class="fas fa-heart" :class="isLikedByCurrentUser ? 'green-heart' : 'white-heart'"></i>
        {{ post.likes_count }}
      </button>

      <button class="comment-button" @click="handleComments">
        <i class="fas fa-comment"></i>
        {{ post.comments_count }}
      </button>

      <button class="share-button" @click="handleShare">
        <i class="fas fa-share"></i>
      </button>

      <!-- Botón de edición -->
      <button v-if="isProfileView && isOwnProfile" @click="handleEdit" class="edit-button">
        <i class="fas fa-edit"></i>
      </button>
      <button v-if="isProfileView && isOwnProfile" @click="confirmDelete" class="action-button delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <h2 class="post-title">{{ post.title }}</h2>
    <div class="post-description" v-html="renderedDisplayedDescription"></div>
    <div v-if="post.description && post.description.length > 42" class="see-more" @click="toggleDescription">
      <span>
        {{ showFullDescription ? 'Ver menos' : 'Ver más' }}
        <i class="fas" :class="showFullDescription ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
      </span>
    </div>

    <!-- Usar la propiedad computada parsedIngredients -->
    <div class="ingredients" v-if="parsedIngredients.length">
      <div class="ingredient-tags">
        <span v-for="(ingredient, idx) in displayedIngredients" :key="idx" class="ingredient-tag">
          {{ ingredient.name }} - {{ ingredient.quantity }}
        </span>
      </div>
      <div v-if="parsedIngredients.length > 3" class="see-more" @click="showAllIngredients = !showAllIngredients">
        <span>
          {{ showAllIngredients ? 'Ver menos' : 'Ver más' }}
          <i class="fas" :class="showAllIngredients ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
        </span>
      </div>
    </div>

    <p class="date">{{ formatDate(post.created_at) }}</p>



    <!-- Modal de confirmación -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>¿Estás seguro de que quieres borrar este post?</h3>
        <p>Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button @click="handleDelete" class="confirm-delete">
            Sí, borrar
          </button>
          <button @click="showDeleteModal = false" class="cancel">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { apiService } from '../services/api'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { useUserNotificationStore } from '../stores/interactionNotifications'
import { STORAGE_URL } from '../utils/globalConstants'
import router from '@/router'
import { addToBuffer } from '../services/bufferService';

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
    },
    isProfileView: {
      type: Boolean,
      default: false
    },
    isOwnProfile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isLiked: false,
      showDeleteModal: false,
      userNotifications: useUserNotificationStore(),
      showAllIngredients: false,
      showFullDescription: false   // <-- Nueva propiedad para alternar descripción completa
    }
  },

  computed: {
    userStore() {
      return useUserStore()
    },
    notificationStore() {
      return useNotificationStore()
    },
    isLikedByCurrentUser() {
      const userId = this.userStore.user?.id
      const likedInBackend = this.post.liked_by?.some(l => l.id === userId)
      const hasPendingLike = this.userStore.buffer.some(a => a.type === 'like' && a.post_id === this.post.id && a.user_id === userId)
      const hasPendingUnlike = this.userStore.buffer.some(a => a.type === 'unlike' && a.post_id === this.post.id && a.user_id === userId)

      return (likedInBackend || hasPendingLike) && !hasPendingUnlike
    },
    postUrl() {
      return `/posts/${this.post.id}`
    },
    canEdit() {
      return (
        this.userStore.isAuthenticated &&
        this.isProfileView &&
        this.post.user_id === this.userStore.user?.id
      )
    },
    parsedIngredients() {
      const ing = this.post.ingredients
      if (!ing) return []
      if (Array.isArray(ing)) return ing
      if (typeof ing === 'string') {
        try {
          const validJSON = ing.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          return JSON.parse(validJSON)
        } catch (error) {
          return []
        }
      }
      return []
    },
    isOwnPost() {
      return this.post.user_id === this.userStore.user?.id
    },
    displayedIngredients() {
      return this.showAllIngredients
        ? this.parsedIngredients
        : this.parsedIngredients.slice(0, 3);
    },
    displayedDescription() {
      const limit = 42; // Limitar a 42 caracteres
      if (!this.post.description) return '';
      if (this.showFullDescription || this.post.description.length <= limit) {
        return this.post.description;
      }
      return this.post.description.substring(0, limit) + '...';
    },
    renderedDisplayedDescription() {
      const text = this.displayedDescription || ''
      return this.parseMarkdownToHtml(text)
    }
  },

  methods: {
    getInitials(name) {
      if (!name || typeof name !== 'string') return 'U'
      return name
        .trim()
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
    },
    formatDate(date) {
      if (!date) return ''
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      } catch {
        return String(date)
      }
    },
    parseMarkdownToHtml(str) {
      // Parser con soporte simple de listas, citas y estilos inline
      if (str == null) return ''
      const escape = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      const formatInline = (s) => {
        return escape(s)
          .replace(/```([^`\n]+)```/g, '<code class="mono">$1<\/code>')
          .replace(/`([^`\n]+)`/g, '<code>$1<\/code>')
          .replace(/\*([^*\n]+)\*/g, '<strong>$1<\/strong>')
          .replace(/_([^_\n]+)_/g, '<em>$1<\/em>')
          .replace(/~([^~\n]+)~/g, '<del>$1<\/del>')
          .replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank">$1<\/a>')
      }
      // Normalizar líneas para evitar marcadores sueltos como "- " o "1. " que generan viñetas vacías
      const rawLines = String(str).split('\n')
      const lines = rawLines.map(l => {
        const t = l.replace(/\u00A0/g, ' ').trimEnd()
        if (/^\s*([*-])\s*$/.test(t)) return '' // línea con solo "-" o "*"
        if (/^\s*\d+\.\s*$/.test(t)) return '' // línea con solo "n."
        // compactar duplicados "- - texto" -> "- texto"
        return t.replace(/^\s*-\s*-\s+/, '- ')
      })
      const out = []
      let i = 0
      while (i < lines.length) {
        const line = lines[i]
        // Numeradas (también si vienen precedidas erróneamente por un guión "- 1. texto")
        if (/^\s*(?:[-*]\s+)?\d+\.\s+\S+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*(?:[-*]\s+)?\d+\.\s+\S+/.test(lines[i])) {
            const cleaned = lines[i].replace(/^\s*[-*]\s+/, '')
            const text = cleaned.replace(/^\s*\d+\.\s+/, '')
            items.push('<li>' + formatInline(text) + '</li>')
            i++
          }
          out.push('<ol>' + items.join('') + '</ol>')
          continue
        }
        // Viñetas
        if (/^\s*([*-])\s+\S+/.test(line) && !/^\s*([*-])\s+\d+\.\s+\S+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*([*-])\s+\S+/.test(lines[i]) && !/^\s*([*-])\s+\d+\.\s+\S+/.test(lines[i])) {
            const text = lines[i].replace(/^\s*([*-])\s+/, '')
            items.push('<li>' + formatInline(text) + '</li>')
            i++
          }
          out.push('<ul>' + items.join('') + '</ul>')
          continue
        }
        // (La regla de numeradas ya se evaluó primero)
        // Citas
        if (/^\s*>\s+\S+/.test(line)) {
          const parts = []
          while (i < lines.length && /^\s*>\s+\S+/.test(lines[i])) {
            parts.push(formatInline(lines[i].replace(/^\s*>\s+/, '')))
            i++
          }
          out.push('<blockquote>' + parts.join('<br>') + '</blockquote>')
          continue
        }
        out.push(formatInline(line))
        i++
      }
      return out.join('<br>')
    },
    getImageUrl(image) {
      if (!image) return null;
      return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`;
    },

    handleComments() {
      if (!this.userStore.isAuthenticated) {
        this.notificationStore.show('Debes iniciar sesión para ver los comentarios', 'warning');
        return;
      }
      this.$emit('show-comments', this.post.id);
    },

    handleShare() {
      const postUrl = `${window.location.origin}/posts/${this.post.id}`
      if (navigator.share) {
        navigator.share({
          title: this.post.title,
          text: this.post.description || '',
          url: postUrl
        }).catch((error) => {
          window.location.href = postUrl
        })
      } else {
        try {
          navigator.clipboard.writeText(postUrl)
            .then(() => {
              this.notificationStore.show('Enlace copiado al portapapeles', 'success')
            })
            .catch(() => {
              window.location.href = postUrl
            })
        } catch {
          window.location.href = postUrl
        }
      }
    },

    navigateToPost() {
      if (!this.showInModal) {
        this.$router.push(this.postUrl)
      }
    },

    handleImageError(e) {
      e.target.src = '/default-post-image.jpg'
    },

    handleEdit() {
      this.$emit('edit-post', this.post)
    },
    handleLike() {
      this.userStore.toggleLike(this.post, this.notificationStore)
    },
    async handlePostUpdated() {
      this.handleModalClose();
      // Aquí recargas los posts (ver opción 1)
    },
    confirmDelete() {
      this.showDeleteModal = true
    },

    handleDelete() {
      apiService.deletePost(this.post.id)
        .then(() => {
          this.notificationStore.show('Post eliminado correctamente', 'success')
          this.$emit('post-deleted', this.post.id)
        })
        .catch(error => {
          this.notificationStore.show(
            error.response?.data?.message || 'Error al eliminar el post',
            'error'
          )
        })
        .finally(() => {
          this.showDeleteModal = false
        })
    },


    toggleDescription() {
      this.showFullDescription = !this.showFullDescription;
    }
  },
}
</script>


<style scoped>
/* === Tarjeta de publicación (PostCard) === */
.post-card {
  flex-shrink: 0;
  text-align: left;
  background-color: var(--sombra-color);
  border-radius: 10px;
  color: var(--text-color-important);
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease;
}


/* === Cabecera del post === */
.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  align-content: center;
  justify-content: center;
  margin-top: .5em;
}

/* Enlace del nombre de usuario */
.username-link {
  text-decoration: none;
  color: inherit;
}

/* === Información de usuario === */
.user-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  width: 100%;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
}

.avatar {
  width: 50px;
  height: 50px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.role-badge {
  background-color: var(--contrast-color);
  color: #FEFDF4;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  text-transform: capitalize;
  margin-left: .5em;
}

/* === Imagen del post === */
.post-image-link {
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
  max-height: 50%;
}

.post-image-link:hover {
  transform: scale(1.02);
}

.post-img {
  width: 100%;
  /* 40% de la altura del card */
  object-fit: contain;
  aspect-ratio: auto;
  border-radius: 10px;
  margin: 10px 0;
  max-height: 100%;
}

/* === Título y descripción === */
.post-title {
  font-size: clamp(.5rem, 1vw, 1rem);

  margin: 10px 0;
}

.post-description {
  font-size: 16px;
  color: black;
  margin-top: 10px;
  max-width: 90%;
  word-wrap: break-word;
  white-space: pre-wrap;
  /* Esto hará que se respeten los saltos de línea */
}

/* === Sección de ingredientes === */
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

.see-more {
  color: var(--primary-color);
  cursor: pointer;
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
  width: fit-content;
  align-items: center;
  justify-content: center;
  align-content: center;
  margin: .5em auto;
  font-size: 10px;
}

/* === Fecha === */
.date {
  font-size: 0.9em;
  color: gray;
}

/* === Acciones (botones de like, comentario y share) === */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-top: 15px;
}

.actions button,
.share-button {
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

.actions button:hover,
.share-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.actions button.liked i.fas.fa-heart {
  color: var(--primary-color);
}

.edit-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}


.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit {
  background-color: var(--primary-color);
  color: var(--text-color-important);
}

.delete {
  background-color: var(--primary-color);
  color: var(--text-color-important);
}

.edit:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--primary-color);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-delete {
  background-color: var(--contrast-color);
  color: white;
}

.cancel {
  background-color: var(--secundary-color);
}

/* Media queries para ajustar la imagen en pantallas más pequeñas */
@media (max-width: 768px) {

  .post-card {
    height: calc(100vh - 130px);
    padding: 15px;
  }

  .post-title {
    font-size: 1.3em;
    margin: 8px 0;
  }

  .post-description {
    font-size: 0.95em;
    margin-bottom: 8px;
  }

  .ingredient-tag {
    font-size: 0.85em;
    padding: 4px 10px;
  }

  .date {
    font-size: 0.85em;
  }
}

@media (max-width: 600px) {
  .post-card {
    height: calc(100vh - 180px);
    padding: 15px;
  }


}

@media (max-width: 480px) {
  .post-card {
    padding: 10px;
  }

  .post-title {
    font-size: 1.1em;
    margin: 6px 0;
  }

  .post-description {
    font-size: 0.9em;
    margin-bottom: 6px;
  }

  .ingredient-tag {
    font-size: 0.8em;
    padding: 3px 8px;
  }

  .date {
    font-size: 0.8em;
  }

  /* Ajustar botones y acciones */
  .actions button,
  .share-button {
    font-size: 0.9em;
    padding: 6px 12px;
  }
}

.green-heart {
  color: var(--primary-color);
}

.white-heart {
  color: white;
}
</style>
