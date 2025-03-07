<template>
  <section class="user-posts">
    <div v-if="loading" class="loading-message">Cargando posts...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="posts.length === 0" class="empty-message">No hay posts para mostrar.</div>
    <div v-else class="posts-container">
      <PostCard class="profile-post-card" v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '../utils/globalConstants'
import PostCard from './PostCard.vue'

export default {
  name: 'UserPosts',
  components: { PostCard },
  props: {
    userId: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const posts = ref([])
    const loading = ref(true)
    const error = ref(null)
    
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/users/${props.userId}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        if (data && data.data) {
          posts.value = data.data
        } else {
          error.value = 'Formato de respuesta inválido'
        }
      } catch (err) {
        console.error('Error al obtener posts:', err)
        error.value = 'Error al cargar tus posts.'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserPosts()
    })

    return { posts, loading, error }
  }
}
</script>

<style scoped>
.user-posts {
  margin: 30px 0 0 0  ;
}

.user-posts h3 {
  margin-bottom: 15px;
  text-align: center;
  color: var(--text-color);
}

.posts-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    overflow-y: auto;
    width: 100%;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
}


.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 20px;
  background-color: var(--secundary-color);
  border-radius: 10px;
  margin-top: 20px;
  color: var(--text-color);
}
</style>