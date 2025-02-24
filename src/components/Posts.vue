<template>
  <button id="scrollRightButton"><i class="fa-solid fa-arrow-right"></i></button>
  <button id="scrollLeftButton"><i class="fa-solid fa-arrow-left"></i></button>

  <main id="main">
    <div id="main-scroll-container">
      <section id="publicaciones">
        <article v-for="(post, index) in posts" :key="post.id" :id="'post-' + post.id">
          <div class="post-header">
            <img :src="post.profileImage" alt="Profile image" class="profile-img" />
            <h3>{{ post.author }}</h3>
          </div>

          <img :src="post.image" alt="Post image" class="post-img" />
          <h2>{{ post.title }}</h2>
          <p>{{ post.content }}</p>
          <p><strong>Date:</strong> {{ post.date }}</p>

          <div class="actions">
            <i :id="'tenedor' + index" class="fas fa-utensils" :class="{ liked: likedPosts.includes(index) }"
              @click="toggleLike(index)">
            </i>
            <span :id="'numeroTenedor' + index">{{ likeCounters[index] || 0 }}</span>

            <i class="fa-solid fa-comments"></i>
            <span>0</span>

            <i class="fa-solid fa-share" @click="compartirPost(index, post.image)"></i>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<script>
import { post } from '../utils/post.js';
import { nextTick } from 'vue';

export default {
  data() {
    return {
      posts: [],
      likeCounters: JSON.parse(localStorage.getItem("likeCounters")) || {},
      likedPosts: JSON.parse(localStorage.getItem("likedPosts")) || []
    };
  },
  mounted() {
    fetch("/posts.json")
      .then(response => response.json())
      .then(data => {
        this.posts = data.map((post, index) => ({
          ...post,
          profileImage: `https://xsgames.co/randomusers/assets/avatars/pixel/${index}.jpg`
        }));
        // Llamar a la función post después de cargar los posts
        nextTick(() => {
          const fragmento = window.location.hash.substring(1);
          post(fragmento);
        });
      });
  },
  methods: {
    toggleLike(index) {
      const tenedorIcon = document.getElementById(`tenedor${index}`);
      const numeroTenedor = document.getElementById(`numeroTenedor${index}`);

      if (this.likedPosts.includes(index)) {
        // Se quita el like (partículas rojas)
        this.likeCounters[index] = (this.likeCounters[index] || 1) - 1;
        this.likedPosts = this.likedPosts.filter(i => i !== index);
        this.crearParticulas(tenedorIcon, "#18C894"); // Color rojo
      } else {
        // Se da like (partículas verdes)
        this.likeCounters[index] = (this.likeCounters[index] || 0) + 1;
        this.likedPosts.push(index);
        this.crearParticulas(tenedorIcon, "#18C894"); // Color verde
      }

      numeroTenedor.textContent = this.likeCounters[index];

      localStorage.setItem("likeCounters", JSON.stringify(this.likeCounters));
      localStorage.setItem("likedPosts", JSON.stringify(this.likedPosts));
    },

    crearParticulas(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;

      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.style.zIndex = '1';

        particle.classList.add("particle");

        const angle = Math.random() * 2 * Math.PI;
        const distance = 15 + Math.random() * 25;
        const xOffset = distance * Math.cos(angle);
        const yOffset = distance * Math.sin(angle);

        const size = Math.random() * 15 + 10;
        particle.style.position = "absolute";
        particle.style.top = `${centerY}px`;
        particle.style.left = `${centerX}px`;
        particle.style.backgroundColor = "#18C894";
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = "50%";
        particle.style.zIndex = "1000";
        particle.style.opacity = "1";
        particle.style.transition = "transform 1s ease-out, opacity 1s ease-out";

        document.body.appendChild(particle);

        setTimeout(() => {
          particle.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(0)`;
          particle.style.opacity = "0";
        }, 50);

        setTimeout(() => {
          particle.remove();
        }, 1000); // Espera un poco más para evitar que desaparezcan instantáneamente
      }
    },

    compartirPost(index, imagenSrc) {
      const enlaceUnico = `${window.location.href.split("#")[0]}#post-${index}`;

      if (navigator.share) {
        navigator.share({
          title: "Recetagram",
          text: "¡Mira esta increíble receta en Recetagram!",
          url: enlaceUnico
        });
      } else {
        alert("La funcionalidad de compartir no está disponible en este navegador.");
      }
    }
  }
};
</script>

<style scoped>
#main {
  grid-area: var(--main-area);
  width: 88%;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  margin: 5% 0;
  overflow-y: hidden;
  overflow-y: -webkit-hidden-unscrollable;
}

#scrollLeftButton,
#scrollRightButton {
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background-color: var(--contrast-color);
  color: #FEFDF4;
  position: absolute;
  top: 10%;
}

#scrollLeftButton {
  left: 30%;
}

#scrollRightButton {
  right: 25%;
}

#main-scroll-container {
  display: flex;
  width: 100%;
  margin: 50px 0;
}

#publicaciones {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  margin: 0 auto;
}

article {
  max-width: 400px;
  text-align: center;
  padding: 20px;
  background-color: var(--sombra-color);
  border-radius: 10px;
  color: var(--text-color);
}

.profile-img {
  width: 55px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.post-img {
  max-width: 300px;
  max-height: 300px;
  cursor: pointer;
  aspect-ratio: 4 / 4;
  object-fit: fill;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.actions {
  cursor: pointer;
}

.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #18C894;
  border-radius: 50%;
  animation: particleAnimation 1s ease-out;
  z-index: 1000;
}

@keyframes particleAnimation {
  to {
    transform: translate(0, -30px) scale(0);
    opacity: 0;
  }
}
</style>