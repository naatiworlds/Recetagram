<template>
  <main id="main" ref="mainContainer">
    <div id="main-scroll-container">
      <!-- Botón para mover hacia la izquierda -->
      <button id="scrollLeftButton" @click="scrollLeft">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <!-- Contenedor de publicaciones -->
      <section id="publicaciones" ref="publicaciones">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
          @open-comments="handleComments(post.id)"
        />
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
import PostCard from '../components/PostCard.vue'
import CommentModal from '../components/CommentModal.vue'
import { API_BASE_URL } from '../utils/globalConstants'
import { useCommentsStore } from '../stores/comments'
import { useLikesStore } from '../stores/likes'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

export default {
  components: {
    PostCard,
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

    handleComments(postId) {
      this.selectedPostId = postId;
      this.showComments = true;
    },

    closeComments() {
      this.showComments = false;
      this.selectedPostId = null;
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
