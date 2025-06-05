<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section class="user-config-container">
      <header>
        <h2>Configuración de Usuario</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>
      <main class="form-container">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.name" :class="{ active: activeTab === tab.name }"
            @click="activeTab = tab.name">
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-content">
          <!-- Edición de Usuario -->
          <div v-if="activeTab === 'user'" class="user-edit">
            <h3>Editar Usuario</h3>
            <form @submit.prevent="updateUser">
              <div class="title-description">
                <h4>Cambiar nombre</h4>
                <p>Esta acción cambiará el nombre que los usuarios verán al buscarte</p>
              </div>
              <label>
                Nombre:
                <input type="text" v-model="user.name" placeholder="Nombre de usuario" />
              </label>
              <button type="submit" class="save-button">Guardar Cambios</button>
            </form>
            <div class="close-session">
              <div class="title-description">
                <h4>Cerrar sesión</h4>
                <p>Esta acción cerrará tu sesión hasta que vuelva a iniciarla</p>
              </div>
              <li v-if="isAuthenticated">
                <a href="#" @click.prevent="handleLogout" class="nav-normal">
                  <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                </a>
              </li>
            </div>
          </div>

          <!-- Preferencias del Sistema -->
          <div v-if="activeTab === 'preferences'" class="system-preferences">
            <h3>Preferencias del Sistema</h3>
            <div class="theme-switch">
              <div class="title-description">
                <h4>Modo de Tema Claro/Oscuro</h4>
                <p>Esta acción cambiará la apariencia de la aplicación a modo dia o noche</p>
              </div>
              <div id="icon-container">
                <div class='wrap'>
                  <input name="light-dark" type="checkbox" @change="toggleTheme" :checked="isDarkMode" />
                  <div class='griddle'></div>
                  <div class='cake'></div>
                  <div class='syrup'></div>
                  <div class='butter'></div>
                  <div class='butter two'></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                  <defs>
                    <filter id="goo">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                        result="goo" />
                      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                  </defs>
                </svg>
                <svg class="svg" viewBox="0 0 400 400">
                  <defs>
                    <filter id="duotone-filter-post-one">
                      <feColorMatrix type="matrix"
                        values="0.14453125 0 0 0 0.33203125 0.71875 0 0 0 0.27734375 -0.34765625 0 0 0 0.73046875 0 0 0 1 0">
                      </feColorMatrix>
                    </filter>
                  </defs>
                </svg>

              </div>
            </div>
            <div class="theme-options">
              <div class="title-description">
                <h4>Modo de Tema Claro/Oscuro</h4>
                <p>Esta acción cambiará la apariencia de la aplicación a modo dia o noche</p>
              </div>
              <div class="colors">
                <li id="theme">
                  <details>
                    <summary><i class="fa-solid fa-palette"></i> theme</summary>
                    <label id="switch-aqua">
                      Aqua
                      <input type="radio" name="tema" value="aqua" @change="setTheme">
                    </label>
                    <label id="switch-pink">
                      Pink
                      <input type="radio" name="tema" value="pink" @change="setTheme">
                    </label>
                    <label id="switch-default">
                      Default
                      <input type="radio" name="tema" value="default" checked @change="setTheme">
                    </label>
                  </details>
                </li>
              </div>
            </div>
          </div>

          <!-- Seguridad y Privacidad -->
          <div v-if="activeTab === 'security'" class="security-privacy">
            <h3>Seguridad y Privacidad</h3>
            <div class="privacy-settings">
              <label>
                <input type="checkbox" v-model="user.isPrivate" @change="togglePrivacy">
                Perfil Privado
              </label>
            </div>
            <div class="blocked-users">
              <h4>Usuarios Bloqueados</h4>
              <ul>
                <li v-for="user in blockedUsers" :key="user.id">
                  {{ user.name }}
                  <button @click="unblockUser(user.id)">Desbloquear</button>
                </li>
              </ul>
            </div>
            <div class="change-password">
              <h4>Cambiar Contraseña</h4>
              <form @submit.prevent="changePassword">
                <label>
                  Contraseña Actual:
                  <input type="password" v-model="password.current" />
                </label>
                <label>
                  Nueva Contraseña:
                  <input type="password" v-model="password.new" />
                </label>
                <button type="submit" class="save-button">Cambiar Contraseña</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<script>
import setupTheme, { applyTheme } from "../utils/changeLightDark.js";
import { changeTheme } from '../utils/changeTheme.js';
import { useUserStore } from '../stores/user.js';
import { useNotificationStore } from '../stores/notification.js';
import { useRouter } from 'vue-router';

export default {
  name: 'UserConfig',
  emits: ['close'],
  data() {
    return {
      activeTab: 'user', // Tab activa
      tabs: [
        { name: 'user', label: 'Cuenta' },
        { name: 'preferences', label: 'Preferencias del Sistema' },
        { name: 'security', label: 'Seguridad y Privacidad' }
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
.modal-overlay {
  grid-area: var(--main-area);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 20px;
}

.oculto~.modal-overlay {
  position: absolute;
  top: 5%;
  width: 100%;
  z-index: 1;
}


.user-config-container {
  background-color: var(--secundary-color);
  border-radius: 10px;
  margin: 1em 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

section header {
  background-color: var(--primary-color);
  border-radius: 10px 10px 0 0;
  padding: var(--espaciado);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

section header h2 {
  font-size: 24px;
  color: var(--text-color-important);
}

.close-button {
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-important);
  cursor: pointer;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: var(--espaciado);
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background-color: var(--primary-color);
  color: var(--text-color-important);
  cursor: pointer;
  border-radius: 5px;
}

.tabs button.active {
  background-color: var(--contrast-color);
  color: var(--text-color);
}

.tab-content {
  padding: var(--espaciado);

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


.tab-content .system-preferences {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2em;
  /* Aumentar el espacio entre los elementos */
  width: 100%;
  /* Asegurar que ocupe todo el ancho disponible */
  margin: 0 auto;
  /* Centrar el contenido horizontalmente */
}

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

form,
.close-session {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
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
  justify-content: space-around;
  width: 100%;
}

.theme-switch label {
  display: flex;
  align-items: center;
  /* Separar el texto del checkbox */
  cursor: pointer;
}

.theme-switch input {
  margin-right: 10px;
}

.theme-options {
  display: flex;
  flex-wrap: wrap;
  /* Aumentar el espacio entre los botones */
  justify-content: space-around;
  align-items: center;

  /* Centrar los botones horizontalmente */
  width: 100%;
  /* Asegurar que ocupe todo el ancho disponible */
}

.theme-options button {
  background: var(--secundary-color);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
}

.theme-options button:hover {
  background: var(--primary-color);
  color: var(--text-color-important);
}

.privacy-settings {
  margin-bottom: 20px;
}

.blocked-users {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 20px;
}

.blocked-users ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blocked-users li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  margin-bottom: 10px;
}

.blocked-users button {
  background: var(--danger-color);
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.blocked-users button:hover {
  background: darken(var(--danger-color), 10%);
}

@media (max-width: 600px) {
  .modal-overlay {
    grid-area: var(--main-responsive-area);
  }
}
</style>