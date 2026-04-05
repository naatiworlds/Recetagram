import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    theme: 'default',
    likeCounters: {},
    likedPosts: [],
    themes: {
      DEFAULT: 'default',
      DARK: 'dark',
      AQUA: 'aqua',
      PINK: 'pink'
    }
  }),

  actions: {
    setTheme(newTheme) {
      this.theme = newTheme;
      localStorage.setItem('selectedTheme', newTheme);
    },

    toggleLikePost(postId) {
      const index = this.likedPosts.indexOf(postId);
      if (index === -1) {
        this.likedPosts.push(postId);
        this.likeCounters[postId] = (this.likeCounters[postId] || 0) + 1;
      } else {
        this.likedPosts.splice(index, 1);
        this.likeCounters[postId] = Math.max(0, (this.likeCounters[postId] || 1) - 1);
      }
      this.saveLikesToStorage();
    },

    saveLikesToStorage() {
      localStorage.setItem('likeCounters', JSON.stringify(this.likeCounters));
      localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
    },

    loadFromLocalStorage() {
      const theme = localStorage.getItem('theme');
      if (theme) this.theme = theme;

      const likeCounters = localStorage.getItem('likeCounters');
      if (likeCounters) this.likeCounters = JSON.parse(likeCounters);

      const likedPosts = localStorage.getItem('likedPosts');
      if (likedPosts) this.likedPosts = JSON.parse(likedPosts);
    }
  }
});
