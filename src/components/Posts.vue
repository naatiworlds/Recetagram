<template>
  <button id="scrollLeftButton"><i class="fa-solid fa-arrow-left"></i></button>
  <button id="scrollRightButton"><i class="fa-solid fa-arrow-right"></i></button>

  <main id="main" ref="mainContainer">
    <div id="main-scroll-container">
      <section id="publicaciones">
        <article v-for="(post, index) in posts" :key="post.id" :id="'post-' + post.id">
          <div class="post-header">
            <img :src="getProfileImage(post)" alt="Profile image" class="profile-img" />
            <div class="user-info">
              <h3>{{ post.user.name }}</h3>
              <span class="user-role">{{ post.user.role }}</span>
            </div>
          </div>

          <img :src="getPostImage(post)" alt="Post image" class="post-img" @error="handleImageError" />
          <h2>{{ post.title }}</h2>
          <p>{{ post.description }}</p>
          <div class="ingredients">
            <div class="ingredient-tags">
              <span v-for="(ingredient, idx) in post.ingredients" :key="idx" class="ingredient-tag">
                {{ ingredient.name }} - {{ ingredient.quantity }}
              </span>
            </div>
          </div>
          <p><strong>Date:</strong> {{ new Date(post.created_at).toLocaleDateString() }}</p>

          <div class="actions">
            <i :id="'tenedor' + index" class="fas fa-utensils" :class="{ liked: likedPosts.includes(index) }"
              @click="toggleLike(index)"></i>
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
import { API_BASE_URL, STORAGE_URL, ANIMATION, DEFAULT_AVATAR_URL } from '../utils/globalConstants';

export default {
  data() {
    return {
      posts: [],
      likeCounters: JSON.parse(localStorage.getItem("likeCounters")) || {},
      likedPosts: JSON.parse(localStorage.getItem("likedPosts")) || []
    };
  },
  mounted() {
    fetch(`${API_BASE_URL}/posts`)
      .then(response => response.json())
      .then(response => {
        console.log('API Response:', response);
        if (response && response.data) {
          // Simply use the data array as is, without mapping
          this.posts = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          console.error('Invalid response format:', response);
          this.posts = [];
        }
        const fragmento = window.location.hash.substring(1);
        post(fragmento);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        this.posts = [];
      });

    this.addScrollListeners();
  },
  methods: {
    addScrollListeners() {
      const scrollLeftButton = document.getElementById("scrollLeftButton");
      const scrollRightButton = document.getElementById("scrollRightButton");
      const mainContainer = this.$refs.mainContainer;

      scrollLeftButton.addEventListener("click", () => {
        // Desplazar hacia la izquierda
        mainContainer.scrollLeft -= ANIMATION.SCROLL_AMOUNT; // Puedes ajustar la cantidad de desplazamiento según tus necesidades
      });

      scrollRightButton.addEventListener("click", () => {
        // Desplazar hacia la derecha
        mainContainer.scrollLeft += ANIMATION.SCROLL_AMOUNT; // Puedes ajustar la cantidad de desplazamiento según tus necesidades
      });
    },

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

      for (let i = 0; i < ANIMATION.PARTICLE_COUNT; i++) {
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
        }, 1000);
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
    },

    getProfileImage(post) {
      if (post.user && post.user.avatar) {
        return `${STORAGE_URL}/${post.user.avatar}`;
      }
      // Fallback a un avatar generado usando el nombre del usuario
      return `${DEFAULT_AVATAR_URL}/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`;
    },

    getPostImage(post) {
      if (post.imagen && post.imagen.startsWith('http')) {
        return post.imagen;
      }
      return `${STORAGE_URL}/${post.imagen}`;
    },

    handleImageError(e) {
      // Establecer una imagen por defecto si la carga falla
      e.target.src = 'ruta/a/tu/imagen/por/defecto.jpg';
    }
  }
};
</script>

<style scoped>
/* Estilos CSS */
#main {
  grid-area: var(--main-area);
  width: 100%;
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
  top: 50%;
  transform: translateY(-50%);
}

#scrollLeftButton {
  left: 20%;
}

#scrollRightButton {
  right: 10px;
}

#main-scroll-container {
  position: relative; /* Necesario para que los botones se posicionen correctamente */
  display: flex;
  width: 100%;
}

#publicaciones {
  display: flex;
  gap: 30px;
  flex-wrap: nowrap;
  margin: 0 auto;
}

article {
  text-align: center;
  padding: 15px 50px;
  background-color: var(--sombra-color);
  border-radius: 10px;
  color: var(--text-color);
}
.post-header{
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-img {
  width: 55px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.post-img {
  max-width: 280px;
  cursor: pointer;
  aspect-ratio: 1 / 1;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-role {
  background-color: var(--contrast-color);
  color: #FEFDF4;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  text-transform: capitalize;
}

.ingredients {
  text-align: left;
  margin: 15px 0;
}

.ingredient-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.ingredient-tag {
  background-color: #e9e9e9;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  color: #333;
  display: inline-block;
}
</style>
