<template>
  <Header @toggle-menu="toggleMenu" />
  <Nav :menu-visible="isMenuVisible" />
  <Notification />
  <router-view />
  
</template>

<script>
import Header from "./shared/Header.vue";
import Nav from "./shared/Nav.vue";
import Notification from './shared/Notification.vue';
// import { useMenu } from './composables/useMenu';
// import { useUserStore } from './stores/user';
import { useRouter } from 'vue-router';

export default {
  components: {
    Header,
    Nav,
    Notification
  },

  data() {
    return {
      isMenuVisible: true
    }
  },

  methods: {
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },

    async initializeAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Primero configuramos el token
          this.userStore.setToken(token);

          // Luego intentamos obtener los datos del usuario
          const response = await this.userStore.initializeAuth();
          if (!response) {
            // Si falla la inicialización pero no es por token expirado
            // simplemente redirigimos al login sin limpiar el token
            this.router.push('/login');
          }
        } catch (error) {
          console.error('Error inicializando la app:', error);
          // Solo limpiamos si es error de autenticación
          if (error.response?.status === 401) {
            this.userStore.clearAuth();
            this.router.push('/login');
          }
        }
      }
    }
  },

  created() {
    // this.userStore = useUserStore();
    this.router = useRouter();
    // this.initializeAuth();
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
  color: var(--text-color);
}

:root {
  /* Paleta de colores */

  --primary-color: #18C894;
  --secundary-color: #FFC763;
  --complementary-color: #FEFDF4;
  --contrast-color: #FF4456;
  --sombra-color: #FFAA3C;
  --text-color-important: black;
  --buttom-color: lightgray;

  /* heights y widths */

  --header-height: 50px;
  --aside-width: 246px;

  /* spacing */

  --espaciado: 17px;
  --nav-spacing-links: 3px;
  --nav-gap-links: 46px;

  /* grid tamplate */

  --columns-grid: .15fr .02fr 1fr .02fr;
  --rows-grid: 0fr 1fr;

  /* grid areas */

  --header-area: 1 / 1 / 1 / 5;
  --aside-area: 2 / 1 / 2 / 1;
  --main-area: 2 / 3 / 3 / 4;
  --contacto-area: 2 / 2 / 3 / 3;
  --main-responsive-area: 2 / 1 / 4 / 4;

  /* font */

  --font-family: 'Fredoka', sans-serif;
  --color-line: rgba(255, 255, 255, 0.2);

  /* Estilos base */
  --max-width-desktop: 1200px;
  --padding-mobile: 1rem;
}

[tema="dark"] {
  --primary-color: #3f3f3f;
  --secundary-color: #717171;
  --complementary-color: #121212;
  --contrast-color: #18C894;
  --sombra-color: #3f3f3f;
  --text-color: white;
  --text-color-important: #18C894;
  --buttom-color: transparent;
  --color-line: rgba(0, 0, 0, 0.2);
}

[tema="aqua"] {
  --primary-color: #007B7F;
  /* Un tono profundo de aqua */
  --secundary-color: #33AFA1;
  /* Un tono más claro de aqua */
  --complementary-color: #005F61;
  /* Un tono más oscuro y profundo para el contraste */
  --contrast-color: #50E3C2;
  /* Un color vibrante y fresco de aqua */
  --sombra-color: #004F4F;
  /* Sombra más oscura para los elementos */
  --text-color: #FFFFFF;
  /* Blanco para el texto */
  --text-color-important: #50E3C2;
  /* Contraste importante en aqua */
  --buttom-color: transparent;
  /* Transparente para botones */
}

[tema="pink"] {
  --primary-color: #ff69b4;
  /* Un tono brillante de rosa */
  --secundary-color: #ff85c1;
  /* Un tono más claro de rosa */
  --complementary-color: #b03060;
  /* Un tono oscuro de rosa para el contraste */
  --contrast-color: #ff1493;
  /* Un rosa vibrante para elementos de contraste */
  --sombra-color: #8b0a50;
  /* Un rosa oscuro para sombras */
  --text-color: #ffffff;
  /* Blanco para el texto */
  --text-color-important: #ff1493;
  /* Rosa vibrante para destacar texto importante */
  --buttom-color: transparent;
  /* Transparente para botones */
}

#app {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
  background-color: var(--complementary-color);
  display: grid;
  width: 100%;
  height: 100vh;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  grid-template-columns: var(--columns-grid);
  grid-template-rows: var(--rows-grid);
  overflow-y: hidden;
}

body::-webkit-scrollbar {
  display: none;
}

main {
  grid-area: var(--main-area);
}


</style>