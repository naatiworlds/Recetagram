<template>
    <div class="tab-content">
        <!-- Seguridad y Privacidad -->
        <div class="security-privacy">
            <h3>Seguridad y Privacidad</h3>
            <div class="privacy-settings">
                <div class="title-description">
                    <h4>Privacidad del perfil público/privado</h4>
                    <p>Esta acción cambiará la privacidad de tu perfil modificando quien puede ver tus posts</p>
                </div>
                <li v-if="isAuthenticated">
                    <a href="#"  class="nav-normal">
                        <i class="fa-solid fa-edit"></i> Editar privacidad
                    </a>
                </li>
            </div>
            <div class="blocked-users">
                <div class="title-description">
                    <h4>Usuarios Bloqueados</h4>
                    <p>Lista de usuarios que has bloqueado</p>
                </div>

                <li v-if="isAuthenticated">
                    <a href="#" class="nav-normal">
                        <i class="fa-solid fa-up-right-from-square"></i> mostrar usuarios bloqueados
                    </a>
                </li>
            </div>
            <div class="change-password">
                <div class="title-description">
                    <h4>Cambiar Contraseña</h4>
                    <p>Esta acción cambiará la contraseña de tu cuenta [Ten mucho cuidado]</p>
                </div>
                <li v-if="isAuthenticated">
                    <a href="#" class="nav-normal">
                        <i class="fa-solid fa-up-right-from-square"></i> Cambiar contraseña
                    </a>
                </li>
            </div>
        </div>
    </div>

</template>

<script>
import setupTheme, { applyTheme } from "../../utils/changeLightDark.js";
import { changeTheme } from '../../utils/changeTheme.js';
import { useUserStore } from '../../stores/user.js';
import { useNotificationStore } from '../../stores/notification.js';
import { useRouter } from 'vue-router';
export default {
    name: 'Security',
    data() {
        return {
            isMenuVisible: false,
            activeTab: 'user', // Tab activa
            tabs: [
                { name: 'user', label: 'Cuenta', icon: 'fa-lg fa-solid fa-user', nav: "/settings/account" },
                { name: 'preferences', label: 'Preferencias del Sistema', icon: 'fa-lg fa-solid fa-sliders', nav: "/settings/preferences" },
                { name: 'security', label: 'Seguridad y Privacidad', icon: 'fa-lg fa-solid fa-lock', nav: "/settings/security" }
            ],
            user: {
                name: '',
                isPrivate: false
            },
            isDarkMode: false, // Estado inicial del tema
            themes: ['Aqua', 'Pink', 'Default'],
            blockedUsers: [],
            password: {
                current: '',
                new: ''
            },
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

        closeModal() {
            this.$emit('close');
        },
        toggleTheme(event) {
            const selectedTheme = event.target.checked ? 'dark' : 'light';
            this.isDarkMode = event.target.checked;
            applyTheme(selectedTheme);
            console.log(`Tema cambiado a: ${selectedTheme}`);
        },
        setTheme(event) {
            const selectedTheme = event.target.value;
            changeTheme(selectedTheme);
        },
        handleLogout() {
            this.userStore.logout();
            this.notificationStore.show('Has cerrado sesión correctamente', 'success', 3000);
            this.router.push('/login');
            this.closeModal();
        },
    },
    mounted() {
        // Sincronizar el estado inicial con el tema actual
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        this.isDarkMode = savedTheme === 'dark';
        applyTheme(savedTheme);
    }
}
</script>

<style scoped>
.tab-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.tab-content h3 {
    background-color: var(--sombra-color);
    color: var(--text-color-important);
    width: 100%;
    text-align: center;
    padding: 1em 1em;
}

.title-description {
    width: 50%;
}

.tab-content>div {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    justify-content: space-around;
    gap: 4em;
}

.tab-content .privacy-settings {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
}

.tab-content .blocked-users {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.tab-content .change-password {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

@media (max-width: 600px) {

    .oculto~.user-config-page {
        padding: 0;
    }

    .user-config-page {
        grid-area: var(--main-responsive-area);
        padding: 0
    }

    .user-config-grid {
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    }
}

@media (max-width: 480px) {

    .user-config-page {
        grid-area: var(--main-responsive-area);
        padding: 0
    }

    .user-config-grid {
        display: block;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    }


}
</style>