<template>
  <main id="main" ref="mainContainer">
    <div id="main-scroll-container">
      <!-- Botón para mover hacia la izquierda -->
      <button id="scrollLeftButton" @click="scrollLeft">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <!-- Contenedor de publicaciones -->
      <section id="publicaciones" ref="publicaciones">
        <article v-for="(post, index) in posts" :key="post.id" :id="'post-' + post.id">
          <div class="post-header">
            <img :src="getProfileImage(post)" alt="Profile image" class="profile-img" />
            <div class="user-info">
              <h3>{{ post.user.name }}</h3>
              <span class="user-role">{{ post.user.role }}</span>
            </div>
          </div>

          <!-- Imagen clickeable -->
          <router-link :to="`/post/${post.id}`" class="post-image-link">
            <img :src="getPostImage(post)" alt="Post image" class="post-img" @error="handleImageError" />
          </router-link>
          <h2>{{ post.title }}</h2>
          <p>{{ post.description }}</p>
          <div class="ingredients">
            <div class="ingredient-tags">
              <span v-for="(ingredient, idx) in post.ingredients" :key="idx" class="ingredient-tag">
                {{ ingredient.name }} - {{ ingredient.quantity }}
              </span>
            </div>
          </div>
          <p><strong>Date:</strong> {{ new Date(post.created_at).toLocaleDateString() }}</p>

          <div class="actions">
            <button @click="handleLike(post.id)" :class="{ liked: likesStore.isLiked(post.id) }">
              <i class="fas fa-heart"></i>
              {{ likesStore.getLikeCount(post.id) }}
            </button>
            
            <button class="comment-button" @click="handleComments(post.id)">
              <i class="fas fa-comment"></i>
              {{ commentsStore.getCommentCount(post.id) }}
            </button>

            <button @click="handleShare(post)" class="share-button">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </article>
      </section>

      <!-- Botón para mover hacia la derecha -->
      <button id="scrollRightButton" @click="scrollRight">
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>

    <!-- Modal de comentarios -->
    <CommentModal 
      v-if="showComments"
      :post-id="selectedPostId"
      @close="closeComments"
    />
  </main>
</template>

<script>
import { post } from '../utils/post.js';
import { API_BASE_URL, STORAGE_URL, ANIMATION, DEFAULT_AVATAR_URL } from '../utils/globalConstants';
import { useCommentsStore } from '../stores/comments'
import { useLikesStore } from '../stores/likes'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import CommentModal from './CommentModal.vue'

export default {
  components: {
    CommentModal
  },
  

  data() {
    return {
      posts: [],
      authStore: useAuthStore(),
      likesStore: useLikesStore(),
      commentsStore: useCommentsStore(),
      notificationStore: useNotificationStore(),
      showComments: false,
      selectedPostId: null
    };
  },
  async mounted() {
    await this.loadPosts();
  },
  methods: {
    async loadPosts() {
      try {
        const response = await fetch(`${API_BASE_URL}/posts`)
        const data = await response.json()
        
        if (data?.data) {
          this.posts = data.data
          
          // Inicializar contadores
          this.likesStore.initializeLikes(this.posts)
          this.commentsStore.initializeComments(this.posts)
        } else {
          throw new Error('No se recibieron datos válidos del servidor')
        }
      } catch (error) {
        this.notificationStore.showNotification(
          'Error al cargar los posts: ' + error.message,
          'error'
        )
        this.posts = []
      }
    },
    scrollLeft() {
      const publicaciones = this.$refs.publicaciones;
      const postCardWidth = publicaciones.children[0].offsetWidth ; // Obtener el ancho de un post
      publicaciones.scrollBy({
        left: -postCardWidth,  // Desplazar hacia la izquierda en el ancho de un post
        behavior: "smooth",    // Desplazamiento suave
      });
    },

    scrollRight() {
      const publicaciones = this.$refs.publicaciones;
      const postCardWidth = publicaciones.children[0].offsetWidth ; // Obtener el ancho de un post
      publicaciones.scrollBy({
        left: postCardWidth + 20,   // Desplazar hacia la derecha en el ancho de un post
        behavior: "smooth",    // Desplazamiento suave
      });
    },
    toggleLike(index) {
      const tenedorIcon = document.getElementById(`tenedor${index}`);
      const numeroTenedor = document.getElementById(`numeroTenedor${index}`);

      if (this.likedPosts.includes(index)) {
        this.likeCounters[index] = (this.likeCounters[index] || 1) - 1;
        this.likedPosts = this.likedPosts.filter(i => i !== index);
        this.crearParticulas(tenedorIcon, "#18C894");
      } else {
        this.likeCounters[index] = (this.likeCounters[index] || 0) + 1;
        this.likedPosts.push(index);
        this.crearParticulas(tenedorIcon, "#18C894");
      }

      numeroTenedor.textContent = this.likeCounters[index];

      localStorage.setItem("likeCounters", JSON.stringify(this.likeCounters));
      localStorage.setItem("likedPosts", JSON.stringify(this.likedPosts));
    },

    compartirPost(index, imagenSrc) {
      const enlaceUnico = `${window.location.href.split("#")[0]}#post-${index}`;

      if (navigator.share) {
        navigator.share({
          title: "Recetagram",
          text: "¡Mira esta increíble receta en Recetagram!",
          url: enlaceUnico
        });
      } else {
        alert("La funcionalidad de compartir no está disponible en este navegador.");
      }
    },
    crearParticulas(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;

      for (let i = 0; i < ANIMATION.PARTICLE_COUNT; i++) {
        const particle = document.createElement("div");
        particle.style.zIndex = '1';

        particle.classList.add("particle");

        const angle = Math.random() * 2 * Math.PI;
        const distance = 15 + Math.random() * 25;
        const xOffset = distance * Math.cos(angle);
        const yOffset = distance * Math.sin(angle);

        const size = Math.random() * 15 + 10;
        particle.style.position = "absolute";
        particle.style.top = `${centerY}px`;
        particle.style.left = `${centerX}px`;
        particle.style.backgroundColor = "#18C894";
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = "50%";
        particle.style.zIndex = "1000";
        particle.style.opacity = "1";
        particle.style.transition = "transform 1s ease-out, opacity 1s ease-out";

        document.body.appendChild(particle);

        setTimeout(() => {
          particle.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(0)`;
          particle.style.opacity = "0";
        }, 50);

        setTimeout(() => {
          particle.remove();
        }, 1000);
      }
    },

    getProfileImage(post) {
      return post.user && post.user.avatar
        ? `${STORAGE_URL}/${post.user.avatar}`
        : `${DEFAULT_AVATAR_URL}/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`;
    },

    getPostImage(post) {
      return post.imagen && post.imagen.startsWith('http')
        ? post.imagen
        : `${STORAGE_URL}/${post.imagen}`;
    },

    handleImageError(e) {
      e.target.src = 'ruta/a/tu/imagen/por/defecto.jpg';
    },

    async handleLike(postId) {
      if (!this.authStore.isAuthenticated) {
        this.notificationStore.showNotification('Debes iniciar sesión para dar like', 'error')
        return
      }

      try {
        await this.likesStore.toggleLike(postId)
      } catch (error) {
        this.notificationStore.showNotification('Error al procesar el like', 'error')
      }
    },

    handleShare(post) {
      this.compartirPost(post.id, this.getPostImage(post));
    },

    handleComments(postId) {
      this.$router.push({
        path: `/post/${postId}`,
        query: { showComments: 'true' }
      })
    },
    closeComments() {
      this.showComments = false
      this.selectedPostId = null
    }
  }
};
</script>

<style scoped>
#main {
  grid-area: var(--main-area);
  width: 100%;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  margin: auto auto;
  position: relative;
}

#main-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;  /* Cambiado de center a flex-start */
  gap: 10px;
  padding-top: 20px; 
}

#scrollLeftButton,
#scrollRightButton {
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
  align-self: flex-start;  /* Cambiado de center a flex-start */
}

#scrollLeftButton {
  left: 0;
}

#scrollRightButton {
  right: 0;
}

#publicaciones {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  overflow-x: scroll;
  scrollbar-width: none;
  padding-bottom: 20px;
  flex: 1;  /* Tomar el espacio restante */
  scroll-behavior: smooth;
}

article {
  text-align: center;
  padding: 20px 40px;
  background-color: var(--sombra-color);
  border-radius: 10px;
  color: var(--text-color);
  min-width: calc(25% - 20px);
  max-width: calc(25% - 20px);
  flex-shrink: 0;
  height: 600px; /* Aumentamos la altura por defecto */
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth; /* Desplazamiento suave */
  
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-img {
  width: 55px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.post-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.actions button, .actions .comment-button {
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
  text-decoration: none; /* Para quitar el subrayado del enlace */
}

.actions button i, .actions .comment-button i {
  font-size: 16px;
}

.actions button:hover, .actions .comment-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.actions button.liked {
  background-color: var(--contrast-color);
}

.comment-button {
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

.comment-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-role {
  background-color: var(--contrast-color);
  color: #FEFDF4;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  text-transform: capitalize;
}

.ingredients {
  text-align: left;
  margin: 15px 0;
}

.ingredient-tag {
  background-color: #e9e9e9;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  color: #333;
  display: inline-block;
}
.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #18C894;
  border-radius: 50%;
  animation: particleAnimation 1s ease-out;
  z-index: 1000;
}

@keyframes particleAnimation {
  to {
    transform: translate(0, -30px) scale(0);
    opacity: 0;
  }
}

/* Media queries para ajuste responsivo */
@media (max-width: 1500px) {
  article {
    min-width: calc(33.33% - 20px); /* Mostrar dos publicaciones por fila */
    max-width: calc(33.33% - 20px);
  }

  
}

@media (max-width: 1200px) {
  article {
    min-width: calc(50% - 20px); /* Mostrar una publicación por fila */
    max-width: calc(50% - 20px);
  }

  #publicaciones {
    width: calc(100% - 40px); /* Ajuste de ancho */
  }
}
@media (max-width: 1000px) {
  article {
    min-width: calc(100% - 20px); /* Mostrar una publicación por fila */
    max-width: calc(100% - 20px);
  }

  #publicaciones {
    width: calc(100% - 40px); /* Ajuste de ancho */
  }
}
@media (max-width: 600px) {
  #main {
    grid-area: 1 / 1 / 3 / 4;
  }
  #main-scroll-container {
    margin-left: 10px;
  }
}

.post-image-link {
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.post-image-link:hover {
  transform: scale(1.02);
}

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

.share-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
