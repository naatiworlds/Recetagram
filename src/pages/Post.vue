<template>
  <div class="post-container">
    <div id="main-scroll-container">
      <section id="publicaciones">
        <div v-if="loading" class="loading">Cargando post...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <template v-else>
          <PostCard v-if="post" :post="post" :show-in-modal="false" @show-comments="handleShowComments" />
        </template>
      </section>
    </div>

    <CommentModal v-if="showComments" :post-id="selectedPostId" :is-open="showComments" @close="handleCloseComments" />
  </div>
</template>

<script>
import CommentModal from '../components/CommentModal.vue'
import PostCard from '../components/PostCard.vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { usePostsStore } from '../stores/posts'

export default {
  name: 'PostView',

  components: {
    CommentModal,
    PostCard
  },

  data() {
    return {
      post: null,
      loading: true,
      error: null,
      showComments: false,
      selectedPostId: null, // <-- agregada
      route: useRoute(),
      router: useRouter(),
      postsStore: usePostsStore(),
      notificationStore: useNotificationStore()
    }
  },

  watch: {
    'route.query.showComments'(newVal) {
      this.showComments = newVal === 'true'
    }
  },

  created() {
    this.fetchPost()
  },

  mounted() {
    if (this.route.query.showComments === 'true') {
      this.showComments = true
    }
  },

  methods: {
    async fetchPost() {
      this.loading = true
      this.error = null
      try {
        const fetchedPost = await this.postsStore.fetchPostById(this.route.params.id)
        if (fetchedPost) {
          this.post = fetchedPost
        } else {
          this.error = 'Post no encontrado'
          this.router.push('/404')
        }
      } catch (err) {
        this.error = 'Error al cargar el post'
        this.notificationStore.show('Error al cargar el post', 'error')
      } finally {
        this.loading = false
      }
    },

    handleShowComments(postId) {
      console.log('Post ID:', postId) // Verificar el ID del post
      this.selectedPostId = postId
      this.showComments = true
      this.router.replace({
        path: this.route.path,
        query: { showComments: 'true' } // Actualizar la query string
      })
    },

    handleCloseComments() {
      this.showComments = false
      this.router.replace({
        path: this.route.path,
        query: {} // Eliminar la query string
      })
    }
  }
}
</script>


<style scoped>
.post-container {
  grid-area: var(--main-area);
  width: 100%;
  margin: 1em auto;
}
.oculto~.post-container {
  position: absolute;
  top: 9%;
  width: 100%;
  z-index: 1;
}

#main-scroll-container {
  width: 100%;
  height: auto;
}
.post-card{
    height: auto;
    padding: 1em 1em;
}
#publicaciones {
  width: fit-content;
  height: fit-content;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  color: var(--text-color);
}

.error {
  color: var(--error-color);
}

.post-detail {
  grid-area: var(--main-area);
  margin: auto auto;
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

@media (max-width: 768px) {
  #publicaciones {
    padding: 10px;
  }

  .post-detail {
    width: 90%;
  }

  .post-img {
    height: 350px;
  }
}
@media (max-width: 600px) {
  .post-container {
    grid-area: var(--main-responsive-area);
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