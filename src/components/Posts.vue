<template>
    <main id="main" ref="mainContainer">
        <div id="main-scroll-container">
            <!-- Botón para mover hacia la izquierda -->
            <button id="scrollLeftButton" @click="scrollLeft">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <!-- Contenedor de publicaciones -->
            <section id="publicaciones" ref="publicaciones">
                <div v-if="loading" class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Cargando posts...
                </div>

                <div v-else-if="error" class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>{{ error }}</h3>
                </div>

                <div v-else-if="!canViewPosts" class="empty-state">
                    <i class="fas fa-lock"></i>
                    <h3>Este perfil es privado</h3>
                    <p v-if="isPendingFollow">Solicitud de seguimiento pendiente</p>
                    <p v-else-if="!isFollowing">Sigue a este usuario para ver sus posts</p>
                </div>

                <div v-else-if="filteredPosts.length === 0" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>{{ emptyStateMessage }}</h3>
                    <p>{{ emptyStateDescription }}</p>
                    <router-link v-if="!isExplorar" to="/explorar" class="explore-button">
                        <i class="fas fa-compass"></i>
                        Explorar usuarios
                    </router-link>
                </div>

                <template v-else>
                    <PostCard v-for="post in filteredPosts" :key="post.id" :post="post" :show-in-modal="false"
                        :is-profile-view="isProfileView" :is-own-profile="isOwnProfile" @edit-post="handleEditPost"
                        @post-deleted="handlePostDelete" @show-comments="handleShowComments"
                        @post-updated="handlePostUpdate" />
                    
                </template>
            </section>

            <!-- Botón para mover hacia la derecha -->
            <button id="scrollRightButton" @click="scrollRight">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
        <CommentModal v-if="showComments" :post-id="selectedPostId" :is-open="showComments" @close="handleCloseComments"
            @post-updated="handlePostUpdate" />
    </main>
</template>

<script>
import PostCard from './PostCard.vue'
// Lazy import de Crear para evitar errores si no se necesita inmediatamente
const CrearComponent = () => import('./Crear.vue')
import { apiService } from '../services/api'
import { useNotificationStore } from '../stores/notification'
import { useUserStore } from '../stores/user'
import { useRoute } from 'vue-router'
import CommentModal from './CommentModal.vue'

export default {
    name: 'Posts',

    components: {
        PostCard,
        CommentModal
    },

    props: {
        userId: {
            type: [String, Number],
            default: null
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        isFollowing: {
            type: Boolean,
            default: false
        },
        isPendingFollow: {
            type: Boolean,
            default: false
        },
        filters: {
            type: Object,
            default: () => ({})
        },
        isProfileView: {
            type: Boolean,
            default: false
        },
        isOwnProfile: {
            type: Boolean,
            default: false
        },
        search: String,
        isExplorar: Boolean
    },

    data() {
        return {
            posts: [],
            loading: true,
            error: null,
            showComments: false,
            selectedPostId: null,
            showEditModal: false,
            postToEdit: null,
            notificationStore: null,
            userStore: null,
            route: null,
            CrearComponent

        }
    },

    computed: {
        // Computed para determinar si estamos en la ruta '/explorar'
        isExplorar() {
            return this.route.path === '/explorar'
        },

        // Filtrar los posts según el filtro de 'explorar'
        filteredPosts() {
            let posts = this.posts;

            if (this.filters.searchTerm) {
                const searchTerm = this.filters.searchTerm.toLowerCase();

                posts = posts.filter(post => {
                    // Preparar ingredientes (parsear si es string)
                    let ingredientsArray = [];
                    try {
                        ingredientsArray = typeof post.ingredients === 'string'
                            ? JSON.parse(post.ingredients)
                            : post.ingredients;
                        if (!Array.isArray(ingredientsArray)) ingredientsArray = [];
                    } catch (e) {
                        ingredientsArray = [];
                    }

                    // Buscar en: título, descripción, autor y nombre de ingredientes
                    return (
                        post.title?.toLowerCase().includes(searchTerm) ||
                        post.description?.toLowerCase().includes(searchTerm) ||
                        post.user?.name?.toLowerCase().includes(searchTerm) ||
                        ingredientsArray.some(ingredient =>
                            ingredient.name?.toLowerCase().includes(searchTerm)
                        )
                    );
                });
            }

            return posts;
        },

        // Si se puede ver los posts (dependiendo de la privacidad)
        canViewPosts() {
            if (!this.isPrivate) return true;
            if (this.userStore.user?.role === 'admin') return true;
            if (this.userId === this.userStore.user?.id) return true;
            return this.isFollowing;
        },

        // Mensajes de estado vacío
        emptyStateMessage() {
            if (this.isUserProfile) return 'No hay posts para mostrar';
            return this.isExplorar
                ? '¡No hay posts públicos disponibles!'
                : '¡No hay posts para mostrar!';
        },

        emptyStateDescription() {
            if (this.isUserProfile) return '';
            return this.isExplorar
                ? 'Parece que aún no hay publicaciones públicas'
                : 'Sigue a otros usuarios para ver sus publicaciones en tu feed';
        }
    },

    methods: {
        // Método para cargar los posts según la ruta y filtros
        async loadPosts() {
            this.error = null;
            try {
                this.loading = true;
                let response;

                // Lógica de carga de posts dependiendo de la ruta y el estado
                if (this.route.path === '/explorar') {
                    response = await apiService.getPublicPosts(this.filterParams);
                } else if (this.userId) {
                    response = await apiService.getUserPosts(this.userId);
                } else if (this.userStore.isAuthenticated) {
                    response = await apiService.getFollowingPosts();
                } else {
                    response = await apiService.getPublicPosts();
                }

                if (response?.data?.status === 'success') {
                    this.posts = response.data.data;
                    // Debug: Revisa los valores de likes_count y comments_count:
                }
            } catch (err) {
                this.error = err.message || 'Error al cargar los posts';
                this.notificationStore.show(this.error, 'error');
            } finally {
                this.loading = false;
            }
        },

        // Método para verificar si la fecha del post está dentro del rango seleccionado
        isWithinDateRange(date, range) {
            const postDate = new Date(date);
            const today = new Date();

            switch (range) {
                case 'today':
                    return postDate.toDateString() === today.toDateString();
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return postDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    return postDate >= monthAgo;
                default:
                    return true;
            }
        },

        // Manejo de actualización de post
        handlePostUpdate(updatedPost) {
            const index = this.posts.findIndex(p => p.id === updatedPost.id);
            if (index !== -1) {
                const updatedPosts = [...this.posts];
                updatedPosts[index] = { ...updatedPosts[index], ...updatedPost };
                this.posts = updatedPosts;
            }
        },
        handleEditPost(post) {
            // Emitir evento hacia el componente `Profile` (el componente padre)
            this.$emit('edit-post', post);
        },

        // Manejo de eliminación de post
        handlePostDelete(postId) {
            this.posts = this.posts.filter(post => post.id !== postId);
        },

        // Mostrar comentarios en modal
        handleShowComments(postId) {
            this.selectedPostId = postId;
            this.showComments = true;
        },

        // Cerrar modal de comentarios
        handleCloseComments() {
            this.showComments = false;
            this.selectedPostId = null;
        },

        // Método para el scroll a la izquierda centrándolo horizontalmente
        scrollLeft() {
            const container = this.$refs.publicaciones;
            if (container && container.children.length > 0) {
                const containerRect = container.getBoundingClientRect();
                const containerWidth = containerRect.width;
                const currentScrollLeft = container.scrollLeft;
                const centerPos = currentScrollLeft + containerWidth / 2;

                let prevPost = null;
                // Iterar desde el final hasta el inicio para encontrar el post previo
                for (let i = container.children.length - 1; i >= 0; i--) {
                    const child = container.children[i];
                    const childRect = child.getBoundingClientRect();
                    const childCenter = childRect.left + childRect.width / 2 + currentScrollLeft - containerRect.left;
                    if (childCenter < centerPos - 1) { // margen de tolerancia
                        prevPost = child;
                        break;
                    }
                }
                if (prevPost) {
                    prevPost.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                }
            }
        },

        // Método para el scroll a la derecha centrándolo horizontalmente
        scrollRight() {
            const container = this.$refs.publicaciones;
            if (container && container.children.length > 0) {
                const containerRect = container.getBoundingClientRect();
                const containerWidth = containerRect.width;
                const currentScrollLeft = container.scrollLeft;
                const centerPos = currentScrollLeft + containerWidth / 2;

                let nextPost = null;
                // Iterar de inicio a fin para encontrar el siguiente post
                for (let i = 0; i < container.children.length; i++) {
                    const child = container.children[i];
                    const childRect = child.getBoundingClientRect();
                    const childCenter = childRect.left + childRect.width / 2 + currentScrollLeft - containerRect.left;
                    if (childCenter > centerPos + 1) { // margen de tolerancia
                        nextPost = child;
                        break;
                    }
                }
                if (nextPost) {
                    nextPost.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
                }
            }
        },
    },

    created() {
        this.notificationStore = useNotificationStore();
        this.userStore = useUserStore();
        this.route = useRoute();
        this.loadPosts();
    },

    watch: {
        filterParams: {
            deep: true,
            handler() {
                this.loadPosts();
            }
        }
    }
};
</script>


<style scoped>
#main {
    grid-area: var(--main-area);
    width: 100%;
    overflow: hidden;
    margin: auto;
    padding: 20px;
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* Ajustado para considerar el header y los filtros */
}


#main-scroll-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
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
    position: sticky;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    height: calc(100vh - 130px);
    /* Altura dinámica */

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
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 20px;
    flex: 1;
    scroll-behavior: smooth;
    height: 100%;
    max-height: calc(100vh - 100px);
    scrollbar-width: none;

}

article {
    flex: 0 0 auto;
    width: calc(33.33% - 20px);
    min-width: 280px;
    max-width: 400px;
    overflow-y: auto;
    margin-right: 20px;
}

.post-card {
    width: 100%;
    max-width: calc(33.33% - 14px);
    height: calc(100vh - 130px);
    margin: 0 auto;
}

.post-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.profile-img {
    border-radius: 50%;
    margin-bottom: 10px;
}

.post-img {
    width: 100%;
    height: 250px;
    border-radius: 10px;
}

.actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.actions button,
.actions .comment-button {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: var(--contrast-color);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 15px;
    border-radius: 5px;
    transition: all 0.2s ease;
    font-size: 14px;
    text-decoration: none;
    /* Para quitar el subrayado del enlace */
}

.actions button i,
.actions .comment-button i {
    font-size: 16px;
}

.actions button:hover,
.actions .comment-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

.actions button.liked {
    background-color: var(--contrast-color);
}

.comment-button {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: var(--contrast-color);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 15px;
    border-radius: 5px;
    transition: all 0.2s ease;
    font-size: 14px;
}

.comment-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

.ingredient-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 8px;
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
@media (max-width: 1500px) {


    article {
        min-width: calc(50% - 10px);
        /* Mostrar dos publicaciones por fila */
    }



}

@media (max-width: 900px) {

    article {
        min-width: calc(100% - 0px);
        /* Mostrar dos publicaciones por fila */
    }


}

@media (max-width: 768px) {

    #scrollLeftButton,
    #scrollRightButton {
        height: calc(100vh - 130px);
        width: 30px;
    }


    .empty-state {
        padding: 2rem;
        height: 500px;
    }

    .empty-state i {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
    }

    .empty-state h3 {
        font-size: 1.3rem;
        margin-bottom: 0.4rem;
    }

    .empty-state p {
        font-size: 0.95rem;
        margin-bottom: 1.2rem;
    }

    .explore-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.95rem;
    }
}

@media (max-width: 600px) {
    #main {
        grid-area: var(--main-responsive-area);
        padding-bottom: var(--mobile-nav-height);
    }

    #scrollLeftButton,
    #scrollRightButton {
        height: calc(100vh - var(--header-height) - var(--mobile-nav-height) - 80px);
    }

    article {
        min-width: 100%;
        /* Mostrar dos publicaciones por fila */
    }
}

@media (max-width: 480px) {


    article {
        height: calc(100vh - 280px);
    }

    #publicaciones {
        grid-template-columns: 1fr;
    }

    .empty-state {
        padding: 1.5rem;
        height: 400px;
    }

    .empty-state i {
        font-size: 2rem;
        margin-bottom: 0.6rem;
    }

    .empty-state h3 {
        font-size: 1.1rem;
        margin-bottom: 0.3rem;
    }

    .empty-state p {
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .explore-button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }

    .loading {
        font-size: 0.9rem;
    }
}

.post-image-link {
    display: block;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.post-image-link:hover {
    transform: scale(1.02);
}

.share-button {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: var(--contrast-color);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 15px;
    border-radius: 5px;
    transition: all 0.2s ease;
    font-size: 14px;
}

.share-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--sombra-color);
    border-radius: 10px;
    width: 100%;
    text-align: center;
    color: var(--text-color);
    height: calc(100vh - 130px);

}

.empty-state i {
    font-size: 3rem;
}

.fa-inbox {
    color: var(--contrast-color);
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.empty-state p {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.explore-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    background-color: var(--contrast-color);
    color: #FEFDF4;
    border-radius: 8px;
    text-decoration: none;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: var(--text-color);
}

.posts-container {
    max-width: var(--max-width-desktop);
    margin: 0 auto;
    padding: 1rem;
}

.post-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

@media (max-width: 768px) {
    #publicaciones {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    #publicaciones {
        margin-bottom: 1rem;
    }
}

@media (max-width: 480px) {
    .post-grid {
        grid-template-columns: 1fr;
    }

    .post-actions {
        flex-direction: column;
        gap: 0.5rem;
    }
}

@media (max-width: 370px) {

    article {
        min-width: 100%;
    }



    #scrollLeftButton {
        left: 0;
        padding: 0;
        margin: 0;
    }
}
</style>