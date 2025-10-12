<template>
  <div class="user-config-page">
    <div class="user-config-grid">
      <!-- Header -->
      <header>
        <h1>Configuración</h1>
      </header>
      <!-- Navegación vertical -->
      <nav class="user-config-nav">
        <router-link 
          v-for="tab in tabs" 
          :key="tab.name" 
          :to="tab.nav" 
          class="nav-button" 
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name">
          <i :class="tab.icon"></i> {{ tab.label }}
        </router-link>
      </nav>

      <!-- Contenido de configuración -->
      <main class="user-config-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import setupTheme, { applyTheme } from "../../utils/changeLightDark.js";
import { changeTheme } from '../../utils/changeTheme.js';
import { useUserStore } from '../../stores/user.js';
import { useNotificationStore } from '../../stores/notification.js';
import { useRouter } from 'vue-router';

export default {
  name: 'UserConfig',
  emits: ['close'],
  data() {
    return {
      isMenuVisible: false,
      activeTab: 'user', // Tab activa
      tabs: [
        { name: 'user', label: 'Cuenta', icon: 'fa-lg fa-solid fa-user', nav: "/settings/account" },
        { name: 'preferences', label: 'Preferencias del Sistema', icon: 'fa-lg fa-solid fa-sliders', nav: "/settings/preferences" },
        { name: 'security', label: 'Seguridad y Privacidad', icon: 'fa-lg fa-solid fa-lock', nav: "/settings/security" }
      ],
      user: {
        name: '',
        isPrivate: false
      },
      isDarkMode: false, // Estado inicial del tema
      themes: ['Aqua', 'Pink', 'Default'],
      blockedUsers: [],
      password: {
        current: '',
        new: ''
      },
      userStore: null,
      notificationStore: null,
      router: null
    };

  },
  created() {
    this.userStore = useUserStore();
    this.notificationStore = useNotificationStore();
    this.router = useRouter();
  },
  computed: {
    isAuthenticated() {
      return this.userStore?.isAuthenticated;
    }
  },
  methods: {

    closeModal() {
      this.$emit('close');
    },
    toggleTheme(event) {
      const selectedTheme = event.target.checked ? 'dark' : 'light';
      this.isDarkMode = event.target.checked;
      applyTheme(selectedTheme);
      console.log(`Tema cambiado a: ${selectedTheme}`);
    },
    setTheme(event) {
      const selectedTheme = event.target.value;
      changeTheme(selectedTheme);
    },
    handleLogout() {
      this.userStore.logout();
      this.notificationStore.show('Has cerrado sesión correctamente', 'success', 3000);
      this.router.push('/login');
      this.closeModal();
    },
  },
  mounted() {
    // Sincronizar el estado inicial con el tema actual
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
    applyTheme(savedTheme);
  }
};
</script>

<style scoped>
.user-config-page {
  grid-area: var(--main-area);
  display: grid;
  background-color: var(--background-color);
  padding: 0 2em;
}

.oculto~.user-config-page {
  position: absolute;
  top: 5%;
  width: 100%;
  z-index: 1;
  margin-top: .2em;
  padding: 0 5em;
}

.user-config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 60px repeat(4, 1fr);
  /* gap: 8px; */
  height: 100%;
}

.user-config-grid header {
  border-top: 1px solid black;
  grid-column: span 5 / span 5;
  background-color: var(--primary-color);
  color: var(--text-color-important);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-config-nav {
  grid-row: span 4 / span 4;
  grid-row-start: 2;
  background-color: var(--secundary-color);
  padding: var(--espaciado);
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-right: 1px solid var(--border-color);
}

.user-config-nav .nav-button {
  padding: 10px 15px;
  border: none;
  background-color: var(--primary-color);
  color: var(--text-color-important);
  cursor: pointer;
  border-radius: 5px;
  text-align: left;
}

.user-config-nav .nav-button.active {
  background-color: var(--contrast-color);
  color: var(--text-color);
}

.user-config-content {
  width: 100%;
  grid-column: span 4 / span 4;
  grid-row: span 4 / span 4;
  grid-row-start: 2;
  padding: 20px;
  padding-bottom: 60px; /* Espacio adicional en la parte inferior */
  overflow-y: auto;
  min-height: calc(100vh - var(--header-height) - 120px); /* Altura mínima considerando header */
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-content h3 {
  background-color: var(--sombra-color);
  color: var(--text-color-important);
  width: 100%;
  text-align: center;
  padding: 1em 1em;
}

.title-description {
  width: 50%;
}

.tab-content>div {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  justify-content: space-around;
  gap: 4em;
}

form {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  width: 100%;
}

.close-session {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  width: 100%;
}

.tab-content .system-preferences {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2em;
  width: 100%;
}

.save-button {
  background-color: var(--primary-color);
  color: var(--text-color-important);
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-button:hover {
  background-color: var(--contrast-color);
}

.theme-switch {
  display: flex;
  align-items: center;
  /* gap: 2em; */
  justify-content: space-between;
  align-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.theme-options {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  align-content: center;
  width: 100%;
  justify-content: space-between;
}

.theme-options label {
  display: flex;
  align-items: center;
  gap: 10px;
  /* Espacio entre el texto y el input */
  cursor: pointer;
}


@media (max-width: 600px) {

  .oculto~.user-config-page {
    padding: 0;
  }

  .user-config-page {
    grid-area: var(--main-responsive-area);
    padding: 0
  }

  .user-config-content {
    padding-bottom: 50px; /* Mantener espacio inferior en móviles */
  }

  .user-config-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 480px) {

  .user-config-page {
    grid-area: var(--main-responsive-area);
    padding: 0
  }

  .user-config-grid {
    display: block;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  }

  .user-config-nav {}
}

/* Estilos y animación sarten */

#icon-container {
  display: flex;
  justify-content: center;
  gap: 1em;
  align-content: stretch;
  flex-wrap: wrap;
  align-items: center;
}

body svg {
  position: absolute;
  width: 0;
  height: 0;
}

body .wrap {
  width: 83px;
  height: 24px;
  min-width: 83px;
  position: relative;
  box-shadow: 0 0 0 10px #fff, 0 0 0 11px #88bda5, 0 0px 20px 15px #88bda5;
  background: #fff;
  border-radius: 100px;
  opacity: 0;
  -webkit-animation: fadein 0.5s ease-in-out 1 forwards;
  animation: fadein 0.5s ease-in-out 1 forwards;
  -webkit-animation-delay: 0.5s;
  animation-delay: 0.5s;
}

@-webkit-keyframes fadein {
  to {
    opacity: 1;
  }
}

@keyframes fadein {
  to {
    opacity: 1;
  }
}

body .wrap input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 999;
  top: 0;
  left: 0;
}

body .wrap input:checked~.syrup:before {
  animation: drip 3.25s ease-out 1 forwards;
  -webkit-animation: drip 3.25s ease-out 1 forwards;
}

@keyframes drip {
  0% {
    transform: translateY(-100vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
    clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  80% {
    transform: translateY(-100vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
    clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  90% {
    transform: translateY(0vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
    clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  100% {
    transform: translateY(0vh);
    -webkit-clip-path: polygon(60% 14%, 40% 16%, 22% 6%, 8% 23%, 2% 36%, 13% 55%, 10% 68%, 7% 96%, 13% 97%, 24% 57%, 38% 56%, 44% 75%, 42% 94%, 61% 97%, 57% 56%, 70% 57%, 80% 92%, 91% 96%, 95% 85%, 86% 51%, 88% 7%);
    clip-path: polygon(60% 14%, 40% 16%, 22% 6%, 8% 23%, 2% 36%, 13% 55%, 10% 68%, 7% 96%, 13% 97%, 24% 57%, 38% 56%, 44% 75%, 42% 94%, 61% 97%, 57% 56%, 70% 57%, 80% 92%, 91% 96%, 95% 85%, 86% 51%, 88% 7%);
  }
}

@-webkit-keyframes drip {
  0% {
    -webkit-transform: translateY(-100vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  80% {
    -webkit-transform: translateY(-100vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  90% {
    -webkit-transform: translateY(0vh);
    -webkit-clip-path: polygon(55% 0, 44% 1%, 39% 9%, 40% 15%, 39% 19%, 38% 24%, 37% 27%, 37% 31%, 39% 34%, 40% 36%, 43% 38%, 46% 39%, 50% 41%, 53% 39%, 55% 37%, 59% 35%, 63% 35%, 64% 31%, 61% 24%, 60% 16%, 59% 9%);
  }

  100% {
    -webkit-transform: translateY(0vh);
    -webkit-clip-path: polygon(60% 14%, 40% 16%, 22% 6%, 8% 23%, 2% 36%, 13% 55%, 10% 68%, 7% 96%, 13% 97%, 24% 57%, 38% 56%, 44% 75%, 42% 94%, 61% 97%, 57% 56%, 70% 57%, 80% 92%, 91% 96%, 95% 85%, 86% 51%, 88% 7%);
  }
}

body .wrap input:checked~.butter {
  animation: drop 3.25s ease-out 1 forwards;
  -webkit-animation: drop 3.25s ease-out 1 forwards;
}

body .wrap input:checked~.butter.two {
  -webkit-animation-delay: 0.25s;
  animation-delay: 0.25s;
  z-index: 12;
  filter: brightness(0.975);
  -webkit-filter: brightness(0.975);
}

@keyframes drop {
  0% {
    transform: translateY(-100vh) rotate(-10deg);
  }

  90% {
    transform: translateY(-100vh) rotate(-10deg);
  }

  100% {
    transform: translateY(0vh) rotate(-10deg);
  }
}

@-webkit-keyframes drop {
  0% {
    -webkit-transform: translateY(-100vh) rotate(-10deg);
  }

  90% {
    -webkit-transform: translateY(-100vh) rotate(-10deg);
  }

  100% {
    -webkit-transform: translateY(0vh) rotate(-10deg);
  }
}

body .wrap input:checked~.cake {
  animation: flip 3.25s linear 1 forwards;
  -webkit-animation: flip 3.25s linear 1 forwards;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

@keyframes flip {
  0% {
    background: transparent;
  }

  45% {
    background: transparent;
    border-radius: 100%;
  }

  50% {
    background: #f5e3be;
    border-radius: 100%;
    transform: translateX(0);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  65% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1) translateX(0) rotateY(0deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  70% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1.5) translateX(5px) rotateY(75deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  75% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1.75) translateX(10px) rotateY(120deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  80% {
    background: #eec87d;
    border-radius: 100%;
    transform: scale(1.1) translateX(35px) rotateY(180deg);
    box-shadow: inset 0 0 5px 15px #f5e3be;
  }

  100% {
    background: #eec87d;
    border-radius: 100%;
    transform: scale(1.1) translateX(35px) rotateY(180deg);
    box-shadow: inset 0 0 5px 10px #f5e3be;
  }
}

@-webkit-keyframes flip {
  0% {
    background: transparent;
  }

  45% {
    background: transparent;
    border-radius: 100%;
  }

  50% {
    background: #f5e3be;
    border-radius: 100%;
    transform: translateX(0);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  65% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1) translateX(0) rotateY(0deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  70% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1.5) translateX(5px) rotateY(75deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  75% {
    background: #f5e3be;
    border-radius: 100%;
    transform: scale(1.75) translateX(10px) rotateY(120deg);
    box-shadow: inset 0 0 5px 90px #f5e3be;
  }

  80% {
    background: #eec87d;
    border-radius: 100%;
    transform: scale(1.1) translateX(35px) rotateY(180deg);
    box-shadow: inset 0 0 5px 15px #f5e3be;
  }

  100% {
    background: #eec87d;
    border-radius: 100%;
    transform: scale(1.1) translateX(35px) rotateY(180deg);
    box-shadow: inset 0 0 5px 10px #f5e3be;
  }
}

body .wrap input:checked~.cake:before {
  animation: pour 3s linear 1 forwards;
  -webkit-animation: pour 3s linear 1 forwards;
  transition: 0.5s ease-in-out;
  transform: scale(1);
}

@keyframes pour {
  0% {
    -webkit-clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
    clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
  }

  25% {
    -webkit-clip-path: polygon(0 24%, 14% 53%, 0 60%, 0 83%, 20% 89%, 43% 67%, 63% 87%, 90% 95%, 96% 79%, 74% 56%, 80% 40%, 100% 15%, 94% 6%, 77% 0, 60% 10%, 38% 30%, 15% 8%);
    clip-path: polygon(0 24%, 14% 53%, 0 60%, 0 83%, 20% 89%, 43% 67%, 63% 87%, 90% 95%, 96% 79%, 74% 56%, 80% 40%, 100% 15%, 94% 6%, 77% 0, 60% 10%, 38% 30%, 15% 8%);
    opacity: 1;
  }

  50% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    opacity: 1;
  }

  75% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    border-radius: 100%;
    opacity: 0;
  }

  100% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    border-radius: 100%;
    opacity: 0;
  }
}

@-webkit-keyframes pour {
  0% {
    -webkit-clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
  }

  25% {
    -webkit-clip-path: polygon(0 24%, 14% 53%, 0 60%, 0 83%, 20% 89%, 43% 67%, 63% 87%, 90% 95%, 96% 79%, 74% 56%, 80% 40%, 100% 15%, 94% 6%, 77% 0, 60% 10%, 38% 30%, 15% 8%);
    opacity: 1;
  }

  50% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    opacity: 1;
  }

  75% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    -webkit-border-radius: 100%;
    opacity: 0;
  }

  100% {
    -webkit-clip-path: polygon(0 24%, 0 41%, 0 60%, 0 78%, 0 100%, 27% 99%, 46% 100%, 81% 100%, 100% 100%, 100% 69%, 100% 38%, 100% 15%, 100% 0, 77% 0, 48% 0, 22% 0, 0 0);
    -webkit-border-radius: 100%;
    opacity: 0;
  }
}

body .wrap input:checked~.griddle {
  animation: turn 2.5s ease-in-out 1 forwards;
  -webkit-animation: turn 2.5s ease-in-out 1 forwards;
  transition-delay: 0px;
}

@keyframes turn {
  0% {
    transform: rotate(0deg);
  }

  65% {
    transform: rotate(0deg) rotateY(-10deg);
  }

  75% {
    transform: rotate(0deg) rotateY(-10deg);
  }

  85% {
    transform: rotate(0deg) rotateY(20deg);
  }

  90% {
    transform: rotate(0deg) rotateY(0deg);
  }

  100% {
    transform: rotate(180deg);
  }
}

@-webkit-keyframes turn {
  0% {
    -webkit-transform: rotate(0deg);
  }

  65% {
    -webkit-transform: rotate(0deg) rotateY(-10deg);
  }

  75% {
    -webkit-transform: rotate(0deg) rotateY(-10deg);
  }

  85% {
    -webkit-transform: rotate(0deg) rotateY(20deg);
  }

  90% {
    -webkit-transform: rotate(0deg) rotateY(0deg);
  }

  100% {
    -webkit-transform: rotate(180deg);
  }
}

body .wrap input:checked~.griddle:after {
  box-shadow: inset 0 -3px 0 #000;
  top: calc(50% - 2.5px);
}

body .wrap .butter {
  position: absolute;
  width: 5%;
  height: 10%;
  background: linear-gradient(to bottom, #ffffa2, #ffffa2 7px, #ffff89 7px);
  right: 27%;
  top: 48%;
  z-index: 13;
  border-radius: 2px;
  transform: translateY(-100vh) rotate(-10deg);
}

body .wrap .butter.two {
  right: 20%;
  top: 71%;
}

body .wrap .syrup {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 11;
  border-radius: 100%;
  right: -20%;
  top: 4%;
  filter: url("#goo");
  -webkit-filter: url("#goo");
}

body .wrap .syrup:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  top: 0;
  left: 0;
  background: #c9af90;
  transform: translateY(-100vh);
}

body .wrap .cake {
  position: absolute;
  width: 50%;
  height: 100%;
  left: 2%;
  top: 3%;
  filter: url("#goo");
  -webkit-filter: url("#goo");
  z-index: 10;
  will-change: transform;
}

body .wrap .cake:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
  background: #f5e3be;
  -webkit-clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
  clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
  transition: 0.5s ease-out;
  transform: scale(0);
}

body .wrap .griddle {
  position: absolute;
  width: 50%;
  height: 100%;
  background: #000;
  top: 0;
  left: 0;
  border-radius: 100%;
  box-shadow: inset 0 0 0 5px #333333, inset 0 0 3px 8px #4d4d4d, inset 0 0 20px 20px #333333;
  z-index: 2;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transform-origin: 40px 50%;
  -webkit-animation: turnback 0.5s ease-in-out 1 forwards;
  animation: turnback 0.5s ease-in-out 1 forwards;
}

@-webkit-keyframes turnback {
  0% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

@keyframes turnback {
  0% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

body .wrap .griddle:before {
  content: "";
  position: absolute;
  width: 52.5%;
  height: 9px;
  top: calc(50% - 5.5px);
  right: -50%;
  background: #333333;
  z-index: -1;
  border-radius: 350% 100% 100% 350%/200% 200% 200% 200%;
}

body .wrap .griddle:after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  top: calc(50% - 5px);
  right: -17px;
  background: #fff;
  border-radius: 100%;
  box-shadow: inset 0 3px 0 #000;
  transition: 0.5s ease-in-out;
  transition-delay: 2s;
}

.toggle-switch {
  display: none;

  perspective: 1000px;
}

#toggleSwitch {
  display: none;
}
</style>