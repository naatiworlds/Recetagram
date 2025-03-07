<template>
    <section v-if="post" class="post-detail">
      <PostCard 
        :post="post"
        :show-in-modal="true"
        @open-comments="showComments = true"
      />
      
      <CommentModal 
        v-if="post"
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
  import { API_BASE_URL, STORAGE_URL } from '../utils/globalConstants'
  import CommentModal from '../components/CommentModal.vue'
  import { useCommentsStore } from '../stores/comments'
  import { useLikesStore } from '../stores/likes'
  import { useAuthStore } from '../stores/auth'
  import { useNotificationStore } from '../stores/notification'
  import PostCard from '../components/PostCard.vue'
  
  export default {
    name: 'PostDetail',
    components: {
      CommentModal,
      PostCard
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
        showComments: false
      }
    },
    async created() {
      const shouldShowComments = this.$route.query.showComments === 'true';
      await this.fetchPost();
      
      if (this.post && shouldShowComments) {
        this.showComments = true;
      }
    },
    methods: {
      async fetchPost() {
        try {
          const response = await fetch(`${API_BASE_URL}/posts/${this.$route.params.id}`);
          const data = await response.json();
          
          if (!data.data) {
            this.$router.push('/404');
            return;
          }
          
          this.post = data.data;
          
          this.likesStore = useLikesStore();
          this.commentsStore = useCommentsStore();
          
          if (!this.post.likes_count) {
            this.post.likes_count = 0;
          }
          
          this.likesStore.initializeLikes([this.post]);
          this.commentsStore.initializeComments([this.post]);
        } catch (error) {
          this.notificationStore.showNotification(
            'Error al cargar los posts: ' + error.message,
            'error'
          );
        }
      },
      closeComments() {
        this.showComments = false;
        this.$router.replace({
          path: this.$route.path,
          query: {}
        });
      }
    },
    watch: {
      '$route.query.showComments': {
        immediate: true,
        handler(newVal) {
          if (this.post) {
            this.showComments = newVal === 'true';
          }
        }
      }
    }
  }
  </script>
  
  <style scoped>
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