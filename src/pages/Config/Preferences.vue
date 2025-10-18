<template>
    <div class="account-container">
        <!-- Card principal de Modo de Tema -->
        <div class="main-card theme-card">
            <h3 class="card-title">Modo de Tema</h3>
            
            <!-- Sub-card para el switch -->
            <div class="sub-card theme-switch-card">
                <h4 class="sub-card-title">Cambiar Claro/Oscuro</h4>
                <p class="sub-card-description">Esta acción cambiará la apariencia de la aplicación a modo dia o noche</p>
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
                                <feColorMatrix in="blur" mode="matrix"
                                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
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
        </div>

        <!-- Card separado para Opciones de Tema -->
        <div class="main-card theme-options-card">
            <h3 class="card-title">Opciones de Tema</h3>
            
            <!-- Sub-card para las opciones -->
            <div class="sub-card theme-options-sub-card">
                <h4 class="sub-card-title">Seleccionar Tema</h4>
                <p class="sub-card-description">Selecciona el tema que prefieras para la aplicación</p>
                
                <!-- Flexbox container para las cards de temas -->
                <div class="theme-cards-container">
                    <!-- Card para tema Aqua -->
                    <div class="theme-card-option" :class="{ active: selectedTheme === 'aqua' }" @click="selectTheme('aqua')">
                        <div class="theme-preview aqua-preview">
                            <div class="theme-color aqua-color"></div>
                        </div>
                        <h5 class="theme-name">Aqua</h5>
                        <p class="theme-description">Tema acuático con tonos azules y verdes</p>
                        <input type="radio" name="tema" value="aqua" :checked="selectedTheme === 'aqua'" @change="setTheme">
                    </div>

                    <!-- Card para tema Pink -->
                    <div class="theme-card-option" :class="{ active: selectedTheme === 'pink' }" @click="selectTheme('pink')">
                        <div class="theme-preview pink-preview">
                            <div class="theme-color pink-color"></div>
                        </div>
                        <h5 class="theme-name">Pink</h5>
                        <p class="theme-description">Tema rosa vibrante y moderno</p>
                        <input type="radio" name="tema" value="pink" :checked="selectedTheme === 'pink'" @change="setTheme">
                    </div>

                    <!-- Card para tema Default -->
                    <div class="theme-card-option" :class="{ active: selectedTheme === 'default' }" @click="selectTheme('default')">
                        <div class="theme-preview default-preview">
                            <div class="theme-color default-color"></div>
                        </div>
                        <h5 class="theme-name">Default</h5>
                        <p class="theme-description">Tema clásico con colores originales</p>
                        <input type="radio" name="tema" value="default" :checked="selectedTheme === 'default'" @change="setTheme">
                    </div>
                </div>
            </div>
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
    name: 'Preferences',
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
            selectedTheme: 'default', // Tema seleccionado actualmente
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
            // theme changed
        },
        setTheme(event) {
            const selectedTheme = event.target.value;
            this.selectedTheme = selectedTheme;
            changeTheme(selectedTheme);
        },
        selectTheme(theme) {
            this.selectedTheme = theme;
            changeTheme(theme);
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
}
</script>
<style scoped>

/* ======== Colores usando variables globales de la app ======== */

/* ======== Contenedor principal ======== */
.account-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--complementary-color);
  padding: var(--espaciado);
  padding-bottom: 2rem;
  overflow-y: auto;
  scroll-behavior: smooth;
  box-sizing: border-box;
  gap: 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
}

/* ===== Scrollbar personalizado ===== */
.account-container::-webkit-scrollbar {
  width: 8px;
}

.account-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.account-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.account-container::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

/* Scrollbar para Firefox */
.account-container {
  scrollbar-width: thin;
  scrollbar-color: #ddd #f5f5f5;
}

/* ======== Cards principales ======== */
.main-card {
  background: var(--complementary-color);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  padding: 1.5rem;
}

.theme-card {
  background: var(--complementary-color);
}

.theme-options-card {
  background: var(--complementary-color);
}

/* ======== Títulos de cards ======== */
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color-important);
  margin: 0 0 1rem 0;
  text-align: left;
  position: relative;
  padding-bottom: 0.5rem;
}

.card-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--text-color-important);
}

/* ======== Sub-cards ======== */
.sub-card {
  background: var(--secundary-color);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px var(--sombra-color);
  border: 1px solid var(--color-line);
}

.theme-switch-card {
  background: var(--secundary-color);
}

.theme-options-sub-card {
  background: var(--secundary-color);
}

/* ======== Títulos de sub-cards ======== */
.sub-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color-important);
  margin: 0 0 0.5rem 0;
}

/* ======== Descripciones ======== */
.sub-card-description {
  font-size: 0.95rem;
  color: var(--text-color-important);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

/* ======== Estilos para inputs dentro de sub-cards ======== */
.sub-card input[type="checkbox"],
.sub-card input[type="radio"] {
  margin: var(--espaciado-sm);
  padding: var(--espaciado-xs);
}

.sub-card label {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.sub-card label:hover {
  background-color: var(--sombra-color);
}

.sub-card details {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs);
  border-radius: 6px;
  background-color: var(--primary-color);
}

.sub-card summary {
  padding: var(--espaciado-sm);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.sub-card summary:hover {
  background-color: var(--sombra-color);
}

.sub-card ul {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs) 0;
}

.sub-card li {
  padding: var(--espaciado-xs);
  margin: var(--espaciado-xs) 0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.sub-card li:hover {
  background-color: var(--sombra-color);
}

/* ======== Responsive ======== */
@media (max-width: 768px) {
  .account-container {
    padding: var(--padding-mobile);
    gap: 1rem;
    overflow-y: auto;
  }

  .main-card {
    padding: var(--padding-mobile);
  }

  .sub-card {
    padding: var(--padding-mobile);
  }
}

@media (max-width: 480px) {
  .account-container {
    padding: 0.75rem;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .main-card {
    padding: 0.875rem;
  }

  .sub-card {
    padding: 0.875rem;
  }

  /* Scrollbar más pequeño en móviles */
  .account-container::-webkit-scrollbar {
    width: 6px;
  }
}

/* ======== Estilos para las cards de temas ======== */
.theme-cards-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.theme-card-option {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
  background: var(--complementary-color);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.theme-card-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--contrast-color);
}

.theme-card-option.active {
  border-color: var(--contrast-color);
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.theme-color {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
}

.aqua-color {
  background: linear-gradient(135deg, #007B7F 0%, #33AFA1 50%, #50E3C2 100%);
}

.pink-color {
  background: linear-gradient(135deg, #ff69b4 0%, #ff85c1 50%, #ff1493 100%);
}

.default-color {
  background: linear-gradient(135deg, #18C894 0%, #FFC763 50%, #FF4456 100%);
}

.theme-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-important);
  margin: 0 0 0.5rem 0;
}

.theme-description {
  font-size: 0.8rem;
  color: var(--text-color);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.theme-card-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Indicador de selección */
.theme-card-option.active::after {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--contrast-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Responsive para las cards de temas */
@media (max-width: 768px) {
  .theme-cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .theme-card-option {
    max-width: 250px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .theme-cards-container {
    gap: 0.75rem;
  }
  
  .theme-card-option {
    padding: 0.75rem;
  }
  
  .theme-preview {
    width: 50px;
    height: 50px;
  }
  
  .theme-name {
    font-size: 0.9rem;
  }
  
  .theme-description {
    font-size: 0.75rem;
  }
}

/* Estilos y animación sarten */

#icon-container {
    display: flex;
    justify-content: center;
    gap: var(--espaciado);
    align-content: stretch;
    flex-wrap: wrap;
    align-items: center;
    padding: var(--espaciado);
    background-color: var(--primary-color);
    border-radius: 8px;
    border: 1px solid var(--color-line);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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