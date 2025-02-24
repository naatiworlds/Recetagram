// src/assets/js/theme.js

export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('tema', 'dark');
    } else {
      root.setAttribute('tema', 'light');
    }
    localStorage.setItem('selectedTheme', theme);
  }
  
  export function setupTheme() {
    document.addEventListener('DOMContentLoaded', function () {
      const themeCheckbox = document.querySelector('input[name="light-dark"]');
      let timerId;
  
      themeCheckbox.addEventListener('change', function (event) {
        clearTimeout(timerId);
        timerId = setTimeout(function () {
          const selectedTheme = event.target.checked ? 'dark' : 'light';
          applyTheme(selectedTheme);
        }, 3000);
      });
  
      const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = systemThemeQuery.matches ? 'dark' : 'light';
  
      const savedTheme = localStorage.getItem('selectedTheme') || systemTheme;
  
      if (savedTheme === 'dark') {
        applyTheme('light');
      } else {
        applyTheme(savedTheme);
      }
    });
  }
export default setupTheme