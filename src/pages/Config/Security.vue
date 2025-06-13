<template>
    <div class="tab-content">
        <!-- Seguridad y Privacidad -->
        <div class="security-privacy">
            <h3>Seguridad y Privacidad</h3>

            <!-- Privacidad del perfil -->
            <div class="privacy-settings" v-if="isAuthenticated">
                <div class="title-description">
                    <h4>Privacidad del perfil público/privado</h4>
                    <p>Esta acción cambiará la privacidad de tu perfil modificando quién puede ver tus posts</p>
                </div>

                <div class="toggle-switch">
                    <div class="switch-container">
                        <input type="checkbox" :id="'privacy-toggle-' + userId" :checked="checkedValue"
                            @change="handlePrivacyChange" :disabled="loading" />
                        <label :for="'privacy-toggle-' + userId" class="toggle-label">
                            {{ isPublic ? 'Público' : 'Privado' }}
                        </label>
                    </div>
                    <div class="privacy-tip">
                        <i class="fas fa-lock"></i>
                        <span>Solo tus seguidores podrán ver tus posts</span>
                    </div>
                </div>
            </div>

            <!-- Cambio de Contraseña -->
            <div class="change-password" v-if="isAuthenticated">
                <div class="title-description">
                    <h4>Cambiar Contraseña</h4>
                    <p>Esta acción cambiará la contraseña de tu cuenta [Ten mucho cuidado]</p>
                </div>

                <li>
                    <a href="#" class="nav-normal" @click.prevent="goToChangePassword">
                        <i class="fa-solid fa-up-right-from-square"></i> Cambiar contraseña
                    </a>
                </li>
                <ModalCambioContraseña v-if="showPasswordModal" @close="showPasswordModal = false" />

            </div>
            <div class="change-password" v-if="isAuthenticated">
                <div class="title-description">
                    <h4>Borrar Cuenta</h4>
                    <p>Esta acción borrará tu cuenta y por ende todas tus publicaciones [Ten mucho cuidado]</p>
                </div>

                <li>
                    <a href="#" class="nav-normal" @click="confirmDelete">
                        <i class="fa-solid fa-up-right-from-square"></i> Borrar cuenta
                    </a>
                </li>
                <DeleteConfirmationModal v-if="showDeleteModal" title="Eliminar Cuenta"
                    message="¿Estás seguro que deseas eliminar esta cuenta?" subtext="Esta acción no se puede deshacer."
                    confirmText="Eliminar cuenta" @confirm="handleDelete" @cancel="showDeleteModal = false" />

            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '../../stores/user.js'
import { useNotificationStore } from '../../stores/notification.js'
import { useRouter } from 'vue-router'
import apiService from '@/services/api'  // Asegúrate de tener este servicio
import ModalCambioContraseña from '@/components/ModalCambioContraseña.vue'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

export default {
    name: 'Security',
    components: {
        ModalCambioContraseña,
        DeleteConfirmationModal,
    },
    data() {
        return {
            loading: false,
            router: null,
            userStore: null,
            notificationStore: null,
            showPasswordModal: false,
            showDeleteModal: false,
        }
    },

    computed: {
        isAuthenticated() {
            return this.userStore?.isAuthenticated
        },

        user() {
            return this.userStore?.user
        },

        checkedValue() {
            return !this.user?.is_public
        },

        userId() {
            return this.user?.id
        },

        isPublic() {
            return this.user?.is_public
        },
    },

    methods: {
        async handlePrivacyChange(e) {
            const newState = !e.target.checked // checkbox checked = privado => newState = false

            if (!this.user || this.loading) return

            try {
                this.loading = true

                const updatedUser = await apiService.updateUser(this.user.id, {
                    is_public: newState,
                })

                if (updatedUser.data) {
                    this.user.is_public = newState
                    const statusMsg = newState
                        ? 'Tu perfil ahora es público'
                        : 'Tu perfil ahora es privado'
                    this.notificationStore.show(statusMsg, 'success')
                }
            } catch (error) {
                this.notificationStore.show('Error al actualizar la privacidad', 'error')
            } finally {
                this.loading = false
            }
        },

        showBlockedUsers() {
            this.notificationStore.show('Funcionalidad de usuarios bloqueados no implementada aún.', 'info')
        },

        goToChangePassword() {
            this.showPasswordModal = true
        },
        confirmDelete() {
            this.showDeleteModal = true
        },
        async handleDelete() {
            try {
                await apiService.deleteUser(this.userStore.user.id)
                await this.userStore.logout()
                this.$router.push('/login')
                this.notificationStore.show('Cuenta eliminada con éxito', 'success')
            } catch (error) {
                this.notificationStore.show('Error al eliminar la cuenta: ' + error.message, 'error')
            }
            this.showDeleteModal = false
        },
        handleModalClose() {
            // Cerrar el modal
            this.showPostModal = false;
            this.postToEdit = null;
        },
    },

    created() {
        this.userStore = useUserStore()
        this.notificationStore = useNotificationStore()
        this.router = useRouter()
    },
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

.toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-direction: column;
}

.switch-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.toggle-label {
    cursor: pointer;
    user-select: none;
    color: var(--text-color);
}

input[type="checkbox"] {
    position: relative;
    width: 50px;
    height: 25px;
    -webkit-appearance: none;
    background-color: var(--secundary-color);
    border-radius: 25px;
    cursor: pointer;
    transition: background 0.3s;
}

input[type="checkbox"]:checked {
    background-color: var(--primary-color);
}

input[type="checkbox"]::before {
    content: "";
    position: absolute;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    background-color: white;
    transition: left 0.3s;
}

input[type="checkbox"]:checked::before {
    left: 27px;
}

input[type="checkbox"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.privacy-tip {
    margin-top: 5px;
    font-size: 0.85em;
    color: #666;
    display: flex;
    align-items: center;
    gap: 5px;
}

.switch-container:hover .privacy-tip {
    opacity: 1;
    visibility: visible;
}

.privacy-tip i {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
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

@media (max-width: 768px) {
    .profile-privacy {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .toggle-switch {
        justify-content: center;
    }

    .privacy-tip {
        display: none;
    }
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