<template>
  <header id="header">
    <div id="icon-Container">
      <div class='wrap'>
        <input name="light-dark" type='checkbox'>
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
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
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
      <div class="toggle-switch">
        <input type="checkbox" id="toggleSwitch" name="toggleSwitch">
        <label for="toggleSwitch" class="chef-hat">
          <div class="hat-top">
            <div class="half-circle left"></div>
            <div class="half-circle middle"></div>
            <div class="half-circle right"></div>
          </div>
          <div class="hat-body">
            <div class="line line1"></div>
            <div class="line line2"></div>
            <div class="line line3"></div>
            <div class="line line4"></div>
            <div class="line line5"></div>
          </div>
          <div class="hat-brim"></div>
        </label>
      </div>
      <i class="fa-solid fa-bars fa-lg" id="toggleMenuButton" @click="toggleMenu"></i>
    </div>
    <h1><a href="/">Recetagram</a></h1>

    <div class="icon-group">
      <div class="notification-wrapper">
        <i class="fa-solid fa-bell fa-lg notificaciones" @click="toggleNotifications"></i>
        <span v-if="notificationStore.unreadCount" class="notification-badge">
          {{ notificationStore.unreadCount }}
        </span>
      </div>
      <i class="fa-solid fa-message fa-lg mensaje"></i>
      <img :src="imagen" alt="Logo" width="50px">
    </div>

    <NotificationModal 
      :is-open="showNotifications" 
      @close="toggleNotifications"
    />
  </header>
</template>

<script>
import { DEFAULT_AVATAR_URL, API_BASE_URL } from '../utils/globalConstants';
import logo from "../assets/descarga.png";
import setupTheme from "../utils/changeLightDark";
import { useInteractionNotificationStore } from '../stores/interactionNotifications.js'
import NotificationModal from '../components/NotificationModal.vue'

export default {
  components: {
    NotificationModal
  },
  
  data() {
    return {
      imagen: logo,
      avatarUrl: DEFAULT_AVATAR_URL,
      isDarkMode: false,
      showNotifications: false
    }
  },
  
  setup() {
    const notificationStore = useInteractionNotificationStore()
    return { notificationStore }
  },
  
  async mounted() {
    setupTheme()
    if (this.notificationStore) {
      console.log('Fetching notifications from Header');
      await this.notificationStore.fetchNotifications()
      console.log('Notifications after fetch:', this.notificationStore.notifications);
    }
  },
  
  methods: {
    toggleMenu() {
      this.$emit("toggle-menu")
    },
    
    async toggleNotifications() {
      console.log('Toggling notifications');
      this.showNotifications = !this.showNotifications
      if (this.showNotifications) {
        await this.notificationStore.fetchNotifications()
        console.log('Notifications after toggle:', this.notificationStore.notifications);
      }
    }
  }
}
</script>

<style scoped>
#header {
    grid-area: var(--header-area);
    background-color: var(--primary-color);
    color: var(--text-color-important);
    padding: var(--espaciado);
    text-align: center;
    width: 100%;
    z-index: 1000;
    height: var(--header-height);
    display: flex;
    flex-wrap: nowrap;
    /* Ajustado para evitar el wrap */
    align-items: center;
    justify-content: space-between;
    align-content: center;
}

#icon-Container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2em;
}

.icon-group {
    display: flex;
    align-items: center;
    gap: 1em;
}

header .mensaje {
    display: none;
}

header h1 {
    margin: 0;
}

header a {
    color: var(--text-color-important);
}

header .fa-lg {
    cursor: pointer;
    font-size: 2em;
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
    clip-path: polygon(49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 50%, 50% 50%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%, 49% 51%);
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

.chef-hat {
    width: 53px;
    height: 40px;
    position: relative;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.hat-top {
    width: 37px;
    height: 15px;
    position: absolute;
    top: 3px;
    left: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
}

.half-circle {
    width: 33%;
    height: 100%;
    background-color: var(--text-color-important);
    border: 2px solid var(--text-color-important);
    border-bottom: none;
    border-radius: 50% 50% 0 0;
    transition: background-color 0.6s;
}

.left {
    border-right: none;
}

.middle {
    border-left: none;
    border-right: none;
}

.right {
    border-left: none;
}

.hat-body {
    width: 37px;
    height: 20px;
    background-color: var(--text-color-important);
    border: 2px solid var(--text-color-important);
    position: absolute;
    top: 14px;
    left: 10px;
    box-shadow: inset 0 -10px 10px rgba(0, 0, 0, 0.1);
    transition: background-color 0.6s;
    overflow: hidden;
    z-index: 1;
}

.hat-brim {
    width: 37px;
    height: 10px;
    background-color: var(--text-color-important);
    border: 2px solid var(--text-color-important);
    border-radius: 0 0 20px 20px;
    border-radius: 0 0 50% 50%;
    position: absolute;
    bottom: 0px;
    left: 10px;
    box-shadow: inset 0 -5px 5px rgba(0, 0, 0, 0.1);
    transition: background-color 0.6s;
}

.line {
    width: 100%;
    height: 2px;
    background-color: var(--color-line);
    position: absolute;
    left: 0;
}

.line1 {
    top: 10px;
}

.line2 {
    top: 20px;
}

.line3 {
    top: 30px;
}

.line4 {
    top: 40px;
}

.line5 {
    top: 50px;
}

#toggleSwitch:checked+.chef-hat {
    transform: rotateY(180deg);
}

#toggleSwitch:checked+.chef-hat .half-circle,
#toggleSwitch:checked+.chef-hat .hat-body,
#toggleSwitch:checked+.chef-hat .hat-brim,
#toggleSwitch:checked+.chef-hat .line {
    background-color: var(--text-color-important);
}

.notification-wrapper {
    position: relative;
    cursor: pointer;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--contrast-color);
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    min-width: 18px;
    text-align: center;
    z-index: 1001; /* Asegurar que el badge esté por encima */
}

.notifications-modal {
    position: fixed;
    top: 60px;
    right: 20px;
    background: var(--complementary-color);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    max-height: 400px;
    z-index: 1000;
    overflow: hidden; /* Añadido para asegurar que el contenido no se desborde */
}

.notifications-content {
    padding: 15px;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--sombra-color);
}

.close-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-color);
}

.notifications-list {
    max-height: 300px;
    overflow-y: auto;
}

.notification-item {
    padding: 10px;
    border-bottom: 1px solid var(--sombra-color);
    cursor: pointer;
}

.notification-item:hover {
    background: var(--primary-color);
}

.notification-item.unread {
    background: var(--primary-color);
    font-weight: bold;
}

.notification-content {
    display: flex;
    flex-direction: column;
}

.notification-message {
    font-size: 1em;
}

.notification-time {
    font-size: 0.8em;
    color: var(--text-color);
    margin-top: 5px;
}

.no-notifications {
    padding: 20px;
    text-align: center;
    color: var(--text-color);
}
</style>