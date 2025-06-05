<template>
    <aside id="aside" :class="{ 'oculto': !menuVisible }">
        <nav>
            <ul>
                <h1>
                    <a href="/">Recetagram</a>
                </h1>
                <li class="nav-normal">
                    <router-link to="/" class="nav-normal">
                        <i class="fa-solid fa-house"></i>
                        Inicio
                    </router-link>
                </li>
                <li class="nav-icon">
                    <router-link to="/" class="nav-icon">
                        <i class="fa-solid fa-house">
                        </i>
                    </router-link>
                </li>

                <li class="nav-normal">
                    <router-link to="/explorar" class="nav-normal">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        Explorar
                    </router-link>
                </li>
                <li class="nav-icon">
                    <router-link to="/explorar" class="nav-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </router-link>
                </li>

                <li class="nav-normal">
                    <a href="#" @click.prevent="handleCrearClick" class="nav-normal">
                        <i class="fa-solid fa-upload"></i>
                        Crear
                    </a>
                </li>
                <li class="nav-icon">
                    <a href="#" @click.prevent="handleCrearClick" class="nav-icon">
                        <i class="fa-solid fa-upload"></i>
                    </a>
                </li>

                <li class="nav-normal">
                    <a href="/profile" @click.prevent="handleProfileClick" class="nav-normal">
                        <i class="fa-solid fa-user"></i>
                        Perfil
                    </a>
                </li>
                <li class="nav-icon">
                    <a href="/profile" class="nav-icon">
                        <i class="fa-solid fa-user">
                        </i>
                    </a>
                </li>

                <li v-if="isAuthenticated" class="nav-normal">
                    <a href="/settings" class="nav-normal">
                        <i class="fa-solid fa-cog"></i> Configuración
                    </a>
                </li>
                <li v-if="isAuthenticated" class="nav-icon">
                    <a href="/settings" class="nav-icon">
                        <i class="fa-solid fa-cog"></i>
                    </a>
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
                            <a>&copy; 2025 Recetagram - Comparte tu cocina</a>
                        </div>
                    </li>
                </footer>
            </ul>
        </nav>
        <Crear v-if="showCrearModal" @close="closeModal" />
        <UserConfig v-if="showConfigModal" @close="closeConfigModal" />
    </aside>
</template>

<script>
import Crear from '../components/Crear.vue';
import UserConfig from '../pages/UserConfig.vue';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notification';
import { useRouter } from 'vue-router';
import { changeTheme } from '../utils/changeTheme';

export default {
    name: 'Nav',

    components: {
        Crear,
        UserConfig
    },

    props: {
        menuVisible: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            showCrearModal: false,
            showConfigModal: false, // Estado para el modal de configuración
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

        handleCrearClick() {
            if (!this.isAuthenticated) {
                this.notificationStore.show(
                    'Debes iniciar sesión para crear un nuevo post',
                    'warning',
                    5000
                );
                this.router.push('/login');
                return;
            }
            this.showCrearModal = true;
        },

        closeModal() {
            this.showCrearModal = false;
        },

        handleProfileClick() {
            if (!this.isAuthenticated) {
                this.notificationStore.show('Debes iniciar sesión para ver tu perfil', 'warning');
                this.router.push('/login');
                return;
            }
            this.router.push('/profile');
        },

        handleConfigClick() {
            if (!this.isAuthenticated) {
                this.notificationStore.show('Debes iniciar sesión para acceder a la configuración', 'warning');
                this.router.push('/login');
                return;
            }
            this.showConfigModal = true; // Mostrar el modal de configuración
        },

        closeConfigModal() {
            this.showConfigModal = false; // Cerrar el modal de configuración
        },


    }
};
</script>


<style scoped>
#aside {
    grid-area: var(--aside-area);
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease-in-out;
    background-color: var(--primary-color);
    display: flex;
    flex-direction: column;
}

.oculto {
    transform: translateX(-100%);
}

nav {
    flex: 1;
    display: flex;
    flex-direction: column;
}

nav ul {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: 20px;
    background-color: var(--primary-color);
    padding: var(--espaciado);
}

h1 {
    margin: 0;
    padding-bottom: var(--espaciado);
    font-size: 1.2em;
    border-bottom: 1px solid black;
}

h1 a {
    color: var(--text-color-important);
    text-decoration: none;
}

/* Ocultar los iconos por defecto */
.nav-icon {
    display: none;
}

footer {
    margin-top: auto;
    /* Empuja el footer al final del contenedor */
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

/* Ocultar los iconos por defecto */
.nav-icon {
    display: none;
}

@media only screen and (max-width: 600px) {
    #aside {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40px;
        /* Altura fija para la barra de navegación */
        z-index: 1000;
    }

    nav {
        height: 100%;
        /* Que ocupe el 100% de la altura del aside */
        position: relative;
        /* Para asegurar que se mantiene dentro del aside */
    }

    nav ul {
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 0;
        background-color: var(--primary-color);
        margin: 0;
        /* Eliminar márgenes */
    }

    h1 {
        display: none;
    }

    nav ul li {
        padding: 5px 10px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Ocultar los elementos con texto */
    .nav-normal {
        display: none;
    }

    /* Mostrar solo los elementos con iconos */
    .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    /* Ocultar elementos adicionales */
    #mensajes,
    #theme,
    footer {
        display: none;
    }

    .nav-icon i {
        font-size: 18px;
        color: var(--text-color);
    }
}

@media (max-width: 480px) {
    nav ul {
        justify-content: center;
        align-items: center;
    }

    nav ul li {
        padding: 0 10px;
    }
}

@media (max-width: 300px) {

    nav ul li {
        padding: 0 7px;
    }
}
</style>