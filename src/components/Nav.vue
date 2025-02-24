<template>
  <aside id="aside" :class="{ 'oculto': !menuVisible }">
    <nav>
      <ul>
        <li><a href="/" class="nav-normal"><i class="fa-solid fa-house"></i> Inicio</a></li>
        <li class="nav-icon"><a href="/" class="nav-icon"><i class="fa-solid fa-house"></i></a></li>

        <li><a href="/explorar" class="nav-normal"><i class="fa-solid fa-magnifying-glass"></i> Explorar</a></li>
        <li class="nav-icon"><a href="/explorar" class="nav-icon"><i class="fa-solid fa-magnifying-glass"></i></a></li>

        <li><a href="#" @click.prevent="openModal" class="nav-normal"><i class="fa-solid fa-upload"></i> Crear</a></li>
        <li class="nav-icon"><a href="#" @click.prevent="openModal" class="nav-icon"><i
              class="fa-solid fa-upload"></i></a></li>

        <li><a href="/sesion" class="nav-normal"><i class="fa-solid fa-user"></i> Perfil</a></li>
        <li class="nav-icon"><a href="/sesion" class="nav-icon"><i class="fa-solid fa-user"></i></a></li>

        <li id="mensajes"><a href="#"><i class="fa-solid fa-message mensajes"></i> Mensajes </a></li>

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
        <footer>
          <li id="redes">
            <div>
              <a href="https://www.instagram.com/recetagram.oficial/" target="_blank"><i
                  class="fa-brands fa-square-instagram fa-2xl"></i></a>
              <a href="https://github.com/naatiworlds/Recetagram" target="_blank"><i
                  class="fa-brands fa-square-github fa-2xl"></i></a>
              <a href="#" target="_blank"><i class="fa-brands fa-linkedin fa-2xl"></i></a>
            </div>
          </li>
          <li id="links">
            <div>
              <a href="#">Información</a>
              <a href="/contacto">Contacto</a>
              <a href="#">Privacidad</a>
              <a href="./pages/Terminos.html">Condiciones</a>
              <a href="#">Idioma</a>
            </div>
          </li>
          <li id="copy">
            <div>
              <a>&copy; 2024 Recetagram - Comparte tu cocina</a>
            </div>
          </li>
        </footer>
      </ul>
    </nav>
    <Crear v-if="showModal" @close="showModal = false" />
  </aside>
</template>

<script>
import { changeTheme } from "../utils/changeTheme";
import Crear from "./Crear.vue";

export default {
  components: {
    Crear
  },
  props: {
    menuVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    setTheme(event) {
      const selectedTheme = event.target.value;
      changeTheme(selectedTheme);

      if (selectedTheme === "default") {
        location.reload();
      }
    }
  }
};
</script>

<style scoped>
#aside {
  grid-area: var(--aside-area);
  max-width: var(--aside-width);
  height: 100vh;
  transition: transform 0.1s ease-in;
  background-color: var(--primary-color);
}

.oculto {
  transform: translateX(-100%);
}

.nav-icon {
  display: none;
}

nav ul {
  text-align: left;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  font-size: 20px;
  background-color: var(--primary-color);
}

nav ul li {
  padding: var(--espaciado);
}

nav a {
  color: var(--text-color);
  text-decoration: none;
}

nav a:hover {
  color: var(--text-color-important);
}

.active {
  font-weight: bold;
}

nav a:active {
  font-weight: bold;
}

#redes div {
  margin: 10px 0;
  display: flex;
  flex-direction: row;
  gap: var(--nav-gap-links);
  justify-content: left;
  text-align: left;
}

#links div {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: .2em;
}

#redes a {
  color: var(--text-color-important);
}

nav #redes,
nav #links,
nav #copy {
  margin: 0 auto;
  text-align: center;
}

nav summary,
nav label {
  color: var(--text-color);
  cursor: pointer;
}

nav summary:hover,
nav label:hover {
  color: var(--text-color-important);
}

nav details label {
  margin: 0 25px;
  display: block;
}
</style>