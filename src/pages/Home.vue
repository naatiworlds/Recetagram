<template>

  <Posts />
</template>

<script>
import Posts from '../components/Posts.vue';

export default {
  components: {
    Posts,
  },
  data() {
    return {
      menuVisible: true, // El menú inicia visible
    };
  },
  
};
</script>

<style scoped>

.oculto~#main {
  position: absolute;
  top: 9%;
  width: 100%;
  z-index: 1;
}

#main>button {
  margin: 20px 0;
  position: absolute;
}

.oculto~#scrollRightButton {
  right: 5%;
  top: 13%;
  z-index: 1000;
}

.oculto~#scrollLeftButton {
  left: 5%;
  top: 13%;
  z-index: 1000;
}

#scrollLeftButton,
#scrollRightButton {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background-color: var(--contrast-color);
  /* Color primario de la paleta */
  color: #FEFDF4;
  /* Texto en color claro para destacar */
  position: absolute;
  top: 10%;
}

#scrollLeftButton:focus,
#scrollRightButton:focus,
article button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  /* Ajusta el color y grosor del resplandor de enfoque */
}

#scrollLeftButton {
  left: 30%;
}

#scrollRightButton {
  right: 25%;
}

#main-scroll-container {
  margin: 50px 0;
  display: flex;
  width: 100%;
  /* Habilita el scroll horizontal en escritorio */
  z-index: 10;

}

#main::-webkit-scrollbar {
  display: none;
}

#publicaciones {
  display: flex;
  justify-content: center;
  padding: var(--espaciado);
  gap: var(--espaciado);
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: center;
  margin: 0 auto;
}

.bold {
  font-weight: bold;
}

article {
  max-width: 400px;
  text-align: center;
  padding: var(--espaciado);
  /* background-color: #FFAA3C; */
  background-color: var(--sombra-color);
  border-radius: 10px;
  font-weight: bold;
  color: var(--text-color);
}

article button {
  background-color: var(--buttom-color);
  color: var(--text-color);
  border: .5px solid var(--text-color);
  border-radius: 2px;
  padding: 1px;
}

.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #18C894;
  /* Color de las bolitas */
  border-radius: 50%;
  animation: particleAnimation 1s ease-out;
  margin-left: 10px;
}


@keyframes particleAnimation {
  to {
    transform: translate(0, -30px) scale(0);
    opacity: 0;
  }
}

#mensajes {
  grid-area: 2 / 3 / 4 / 4;
  color: black;
  background-color: #FFC763;
  padding: 10px;
  height: 100%;
  font-weight: bold;
  overflow-x: hidden;
  width: 100%;
  margin: 0;
}
</style>