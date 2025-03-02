<template>
  <main id="main" ref="mainContainer">
    <div id="main-scroll-container">
      <!-- Botón para mover hacia la izquierda -->
      <button id="scrollLeftButton" @click="scrollLeft">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <!-- Contenedor de publicaciones -->
      <section id="publicaciones" ref="publicaciones">
        <article v-for="(post, index) in posts" :key="post.id" :id="'post-' + post.id">
          <div class="post-header">
            <img :src="getProfileImage(post)" alt="Profile image" class="profile-img" />
            <div class="user-info">
              <h3>{{ post.user.name }}</h3>
              <span class="user-role">{{ post.user.role }}</span>
            </div>
          </div>

          <img :src="getPostImage(post)" alt="Post image" class="post-img" />
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
            <i :id="'tenedor' + index" class="fas fa-utensils like-button" :class="{ liked: likedPosts.includes(index) }"
              @click="toggleLike(index)">
              <span :id="'numeroTenedor' + index">{{ likeCounters[index] || 0 }}</span>
            </i>

            <i class="fa-solid fa-comments comment-button">
              <span>0</span>
            </i>

            <i class="fa-solid fa-share share-button" @click="compartirPost(index, post.image)"></i>
          </div>
        </article>
      </section>

      <!-- Botón para mover hacia la derecha -->
      <button id="scrollRightButton" @click="scrollRight">
        <i class="fa-solid fa-arrow-right"></i>
      </button>
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
      .then((response) => response.json())
      .then((response) => {
        console.log("API Response:", response);
        if (response && response.data) {
          this.posts = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          console.error("Invalid response format:", response);
          this.posts = [];
        }
        const fragmento = window.location.hash.substring(1);
        post(fragmento);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        this.posts = [];
      });
  },
  methods: {
    scrollLeft() {
      const publicaciones = this.$refs.publicaciones;
      const postCardWidth = publicaciones.children[0].offsetWidth ; // Obtener el ancho de un post
      publicaciones.scrollBy({
        left: -postCardWidth,  // Desplazar hacia la izquierda en el ancho de un post
        behavior: "smooth",    // Desplazamiento suave
      });
    },

    scrollRight() {
      const publicaciones = this.$refs.publicaciones;
      const postCardWidth = publicaciones.children[0].offsetWidth ; // Obtener el ancho de un post
      publicaciones.scrollBy({
        left: postCardWidth + 20,   // Desplazar hacia la derecha en el ancho de un post
        behavior: "smooth",    // Desplazamiento suave
      });
    },
    toggleLike(index) {
      const tenedorIcon = document.getElementById(`tenedor${index}`);
      const numeroTenedor = document.getElementById(`numeroTenedor${index}`);

      if (this.likedPosts.includes(index)) {
        this.likeCounters[index] = (this.likeCounters[index] || 1) - 1;
        this.likedPosts = this.likedPosts.filter(i => i !== index);
        this.crearParticulas(tenedorIcon, "#18C894");
      } else {
        this.likeCounters[index] = (this.likeCounters[index] || 0) + 1;
        this.likedPosts.push(index);
        this.crearParticulas(tenedorIcon, "#18C894");
      }

      numeroTenedor.textContent = this.likeCounters[index];

      localStorage.setItem("likeCounters", JSON.stringify(this.likeCounters));
      localStorage.setItem("likedPosts", JSON.stringify(this.likedPosts));
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

    getProfileImage(post) {
      return post.user && post.user.avatar
        ? `${STORAGE_URL}/${post.user.avatar}`
        : `${DEFAULT_AVATAR_URL}/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`;
    },

    getPostImage(post) {
      return post.imagen && post.imagen.startsWith('http')
        ? post.imagen
        : `${STORAGE_URL}/${post.imagen}`;
    },

    handleImageError(e) {
      e.target.src = 'ruta/a/tu/imagen/por/defecto.jpg';
    }
  }
};
</script>

<style scoped>
#main {
  grid-area: var(--main-area);
  width: 90%;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  margin: 5% auto;
  position: relative;
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
  top: 42%;
  transform: translateY(-50%);
  z-index: 10;
  height: 500px; /* Aumentamos la altura por defecto */

}

#scrollLeftButton {
  left: 0;
}

#scrollRightButton {
  right: 0;
}

#publicaciones {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  margin: 0 auto;
  overflow-x: scroll;
  scrollbar-width: none;
  padding-bottom: 20px;
  width: calc(100% - 80px);
  box-sizing: border-box;
  scroll-behavior: smooth; /* Desplazamiento suave */
}

article {
  text-align: center;
  padding: 20px 40px;
  background-color: var(--sombra-color);
  border-radius: 10px;
  color: var(--text-color);
  min-width: calc(33.33% - 20px);
  max-width: calc(33.33% - 20px);
  flex-shrink: 0;
  height: 500px; /* Aumentamos la altura por defecto */
  display: flex;
  flex-direction: column;
  
}

.post-header {
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
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  cursor: pointer;
}
.like-button,
.share-button,
.comment-button {
  padding: 8px 16px;
  background-color: var(--contrast-color);
  border: none;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.like-button span,
.share-button span,
.comment-button span {
  margin-left: 10px;
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

/* Media queries para ajuste responsivo */
@media (max-width: 768px) {
  article {
    height: 450px; /* Aumentamos la altura a 450px en pantallas medianas */
    min-width: calc(50% - 20px); /* Mostrar dos publicaciones por fila */
    max-width: calc(50% - 20px);
  }

  #publicaciones {
    width: calc(100% - 60px); /* Ajuste de ancho */
  }
}



@media (max-width: 480px) {
  article {
    height: 350px; /* Aumentamos la altura en pantallas pequeñas */
    min-width: calc(100% - 20px); /* Mostrar una publicación por fila */
    max-width: calc(100% - 20px);
  }

  #publicaciones {
    width: calc(100% - 40px); /* Ajuste de ancho */
  }
}
</style>
