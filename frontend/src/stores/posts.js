import { defineStore } from 'pinia'
import apiService from '../services/api'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null
  }),

  getters: {
    getPostById: (state) => (id) => {
      if (state.currentPost && state.currentPost.id === id) {
        return state.currentPost
      }
      return state.posts.find(post => post.id === id)
    }
  },

  actions: {
    setPosts(posts) {
      this.posts = posts
    },

    setCurrentPost(post) {
      this.currentPost = post
    },

    setLoading(status) {
      this.loading = status
    },

    setError(error) {
      this.error = error
    },

    updatePost(updatedPost) {
      const index = this.posts.findIndex(p => p.id === updatedPost.id)
      if (index !== -1) {
        this.posts[index] = { ...this.posts[index], ...updatedPost }
      }
    },

    async toggleLike(postId) {
      try {
        const response = await apiService.likePost(postId)
        if (response.data.status === 'success') {
          this.updatePost(response.data.data)
          return true
        }
        return false
      } catch (error) {
        console.error('Error toggling like:', error)
        return false
      }
    },

    updateCommentCount(postId, count) {
      const post = this.getPostById(postId)
      if (post) {
        this.updatePost({
          ...post,
          comments_count: count
        })
      }
    },

    async fetchPosts() {
      this.loading = true
      try {
        const response = await apiService.getFollowingPosts()
        this.posts = response.data.data
      } catch (error) {
        console.error('Error en fetchPosts:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchPublicPosts() {
      this.loading = true
      try {
        const response = await apiService.getPublicPosts()
        this.posts = response.data.data
      } catch (error) {
        console.error('Error en fetchPublicPosts:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchPostById(postId) {
      this.loading = true
      try {
        const response = await apiService.getPost(postId)
        if (response.data.status === 'success') {
          const post = response.data.data
          this.setCurrentPost(post)
          return post
        }
        return null
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 