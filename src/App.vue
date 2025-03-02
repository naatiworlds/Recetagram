<script>
import Header from "./shared/Header.vue";
import Nav from "./components/Nav.vue";
import Notification from './components/Notification.vue'

export default {
  components: {
    Header,
    Nav,
    Notification
  },
  
  data() {
    return {
      menuVisible: true, // El menú inicia visible
    };
  },
  
}
</script>

<template>
  <Header @toggle-menu="menuVisible = !menuVisible" />
  <Nav :menuVisible="menuVisible" />
  <Notification />
  <router-view />

</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
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

  --columns-grid: .5fr 2fr .5fr repeat(2, 0);
  --rows-grid: 0fr 1fr 0fr;

  /* grid areas */

  --header-area: 1 / 1 / 2 / 4;
  --aside-area: 2 / 1 / 4 / 1;
  --main-area: 2 / 2 / 4 / 4;
  --contacto-area: 2 / 1 / 4 / 4;

  /* font */

  --font-family: 'Fredoka', sans-serif;
  --color-line: rgba(255, 255, 255, 0.2);
}

[tema="dark"] {
  --primary-color: #3f3f3f;
  --secundary-color: #717171;
  --complementary-color: #121212;
  --contrast-color: #18C894;
  /* --contrast-color: #5e43f3; */
  /* --contrast-color: #FFC763; */
  --sombra-color: #3f3f3f;
  --text-color: white;
  --text-color-important: #18C894;
  /* --text-color-important: #5e43f3; */
  /* --text-color-important: #FFAA3C; */
  --text-color: white;
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
    margin: 3em 3em;
}
@media only screen and (max-width: 1600px) {

#main{
  width: 83%;
  margin: 5% 5%;

}

}
@media only screen and (max-width: 800px) {

textarea {
  width: 90%;
  margin: 0 auto;
}
#scrollLeftButton {
  left: 40%;
}

#scrollRightButton {
  right: 25%;
}

}

@media only screen and (max-width: 600px) {
body {
  display: block;
  overflow-y: scroll;
}
body .wrap{
  display: none;
}
.icon-group img {
  display: none;
}
.toggle-switch {
  display: block;

}
#main {
  overflow-y: visible;
  overflow-x: visible;
  margin: 0 auto;
  width: 100%;
}

.oculto~#main {
  transform: translateX(0);
}
#toggleMenuButton {
  display: none;
}
#scrollLeftButton,
#scrollRightButton {
  display: none;
}
#main-scroll-container {
  display: block;
  width: 100%;
  overflow-y: visible;
  overflow-x: visible;
}

#main section {
  flex-direction: column;
  flex-wrap: wrap;
}

.mensaje {
  display: block;
  float: right;
}

#mensajes {
  display: none;
}

#theme {
  display: none;
}

#aside {
  height: 0;
  grid-area: 5 / 1 / 6 / 4;
  /* Mover el aside debajo del contenido principal */
}

nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

nav ul {
  background-color: var(--secundary-color);
  /* Ajusta el color de fondo según tus necesidades */
  height: 40px;
  z-index: 1000;
  /* Ajusta el índice z según sea necesario */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: space-around;
  font-size: 15px;
}

nav ul li {
  padding: 10px;
}

nav a {
  color: var(--text-color);
}

nav ul #redes,
nav ul #links,
nav ul #copy {
  display: none;
  /* Ocultar el footer en dispositivos móviles */
}

#contacto {
  width: 90%;
}

}

@media only screen and (max-width: 450px) {
.nav-normal {
  display: none;
}

.nav-icon {
  display: flex;
  font-size: 19px;
}
.chef-hat {
  width: 35px;
  height: 28px;
}
.hat-top {
  width: 25px;
  height: 11px;
  top: 2px;
  left: 5px;
}
.half-circle {
  width: 35%;
}
.hat-body {
  width: 25px;
  height: 13px;
  top: 9px;
  left: 5px;
}
.hat-brim {
  width: 25px;
  height: 6px;
  left: 5px;
}

}

@media only screen and (max-width: 338px) {
nav {
  gap: 0;
}

.nav-normal {
  display: none;
}

.nav-icon {
  font-size: 15px;
}
.chef-hat {
  width: 30px;
  height: 24px;
}
.hat-top {
  width: 21px;
  height: 9px;
  top: 2px;
  left: 4px;
}
.half-circle {
  width: 50%;
}
.hat-body {
  width: 21px;
  height: 11px;
  top: 8px;
  left: 4px;
}
.hat-brim {
  width: 21px;
  height: 5px;
  left: 4px;
}

#main section article {
  width: 100%;
}

#main section article img {
  width: 100%;
}

header {
  gap: 0;
}

#contacto main form {
  width: 100%;
}

#contacto main form div {
  width: 100%;
  display: block;
}

}

@media only screen and (max-width: 282px) {

header {
  font-size: 12px;
}

nav {
  gap: 0;
}

.nav-icon {
  font-size: 12px;
}
.chef-hat {
  width: 25px;
  height: 20px;
}
.hat-top {
  width: 18px;
  height: 8px;
  top: 2px;
  left: 3px;
}
.half-circle {
  width: 60%;
}
.hat-body {
  width: 18px;
  height: 9px;
  top: 7px;
  left: 3px;
}
.hat-brim {
  width: 18px;
  height: 4px;
  left: 3px;
}

nav a {
  font-size: 10px;
}

#main {
  width: 100%;
}

#main section article {
  width: 100%;
}

#main section article img {
  width: 100%;
}

#contacto main form input {
  width: 100%;
}

}
</style>
