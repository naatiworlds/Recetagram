import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'default',
    themes: {
      DEFAULT: 'default',
      DARK: 'dark',
      AQUA: 'aqua',
      PINK: 'pink'
    }
  }),

  getters: {
    currentTheme: (state) => state.theme,
    availableThemes: (state) => Object.values(state.themes)
  },

  actions: {
    setTheme(newTheme) {
      if (this.availableThemes.indexOf(newTheme) !== -1) {
        this.theme = newTheme
        localStorage.setItem('theme', newTheme)
      }
    }
  }
})