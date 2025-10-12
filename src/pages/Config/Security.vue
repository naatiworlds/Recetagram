<template>
    <div class="account-container">
        <!-- Card principal de Seguridad y Privacidad -->
        <div class="main-card security-card">
            <h3 class="card-title">Seguridad y Privacidad</h3>
            
            <!-- Sub-card para Privacidad del perfil -->
            <div class="sub-card privacy-card" v-if="isAuthenticated">
                <h4 class="sub-card-title">Privacidad del perfil público/privado</h4>
                <p class="sub-card-description">Esta acción cambiará la privacidad de tu perfil modificando quién puede ver tus posts</p>
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
        </div>

        <!-- Card separado para Cambio de Contraseña -->
        <div class="main-card password-card" v-if="isAuthenticated">
            
            <!-- Sub-card para el cambio de contraseña -->
            <div class="sub-card password-sub-card">
                <h4 class="sub-card-title">Cambiar Contraseña</h4>
                <p class="sub-card-description">Esta acción cambiará la contraseña de tu cuenta <span class="warning-text">[Ten mucho cuidado]</span></p>
                <button class="action-button password-button" @click.prevent="goToChangePassword">
                    <i class="fa-solid fa-key"></i> Cambiar contraseña
                </button>
            </div>
            <ModalCambioContraseña v-if="showPasswordModal" @close="showPasswordModal = false" />
        </div>

        <!-- Card separado para Borrar Cuenta -->
        <div class="main-card delete-card" v-if="isAuthenticated">
            
            <!-- Sub-card para borrar cuenta -->
            <div class="sub-card delete-sub-card">
                <h4 class="sub-card-title">Borrar Cuenta</h4>
                <p class="sub-card-description">Esta acción borrará tu cuenta y por ende todas tus publicaciones <span class="warning-text">[Ten mucho cuidado]</span></p>
                <button class="action-button delete-button" @click="confirmDelete">
                    <i class="fa-solid fa-trash"></i> Borrar cuenta
                </button>
            </div>
            <DeleteConfirmationModal v-if="showDeleteModal" title="Eliminar Cuenta"
                message="¿Estás seguro que deseas eliminar esta cuenta?" subtext="Esta acción no se puede deshacer."
                confirmText="Eliminar cuenta" @confirm="handleDelete" @cancel="showDeleteModal = false" />
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

/* ======== Colores usando variables globales de la app ======== */

/* ======== Contenedor principal ======== */
.account-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--complementary-color);
  padding: var(--espaciado);
  padding-bottom: 2rem;
  overflow-y: auto;
  scroll-behavior: smooth;
  box-sizing: border-box;
  gap: 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
}

/* ===== Scrollbar personalizado ===== */
.account-container::-webkit-scrollbar {
  width: 8px;
}

.account-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.account-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.account-container::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

/* Scrollbar para Firefox */
.account-container {
  scrollbar-width: thin;
  scrollbar-color: #ddd #f5f5f5;
}

/* ======== Cards principales ======== */
.main-card {
  background: var(--complementary-color);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  padding: 1.5rem;
}

.security-card {
  background: var(--complementary-color);
}

.password-card {
  background: var(--complementary-color);
}

.delete-card {
  background: var(--complementary-color);
}

/* ======== Títulos de cards ======== */
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color-important);
  margin: 0 0 1rem 0;
  text-align: left;
  position: relative;
  padding-bottom: 0.5rem;
}

.card-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--text-color-important);
}

/* ======== Sub-cards ======== */
.sub-card {
  background: var(--secundary-color);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px var(--sombra-color);
  border: 1px solid var(--color-line);
}

.privacy-card {
  background: var(--secundary-color);
}

.password-sub-card {
  background: var(--secundary-color);
}

.delete-sub-card {
  background: var(--secundary-color);
}

/* ======== Títulos de sub-cards ======== */
.sub-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color-important);
  margin: 0 0 0.5rem 0;
}

/* ======== Descripciones ======== */
.sub-card-description {
  font-size: 0.95rem;
  color: var(--text-color-important);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

/* ======== Estilos para inputs dentro de sub-cards ======== */
.sub-card input[type="checkbox"],
.sub-card input[type="radio"] {
  margin: var(--espaciado-sm);
  padding: var(--espaciado-xs);
}

.sub-card label {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.sub-card label:hover {
  background-color: var(--sombra-color);
}

.sub-card details {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs);
  border-radius: 6px;
  background-color: var(--primary-color);
}

.sub-card summary {
  padding: var(--espaciado-sm);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.sub-card summary:hover {
  background-color: var(--sombra-color);
}

.sub-card ul {
  padding: var(--espaciado-sm);
  margin: var(--espaciado-xs) 0;
}

.sub-card li {
  padding: var(--espaciado-xs);
  margin: var(--espaciado-xs) 0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.sub-card li:hover {
  background-color: var(--sombra-color);
}

/* ======== Botones de acción ======== */
.action-button {
    width: 100%;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-align: center;
}

.password-button {
  background: #3498db;
  color: white;
}

.password-button:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.delete-button {
  background: #e74c3c;
  color: white;
}

.delete-button:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

/* ======== Toggle Switch ======== */
.toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
}

.switch-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    justify-content: center;
}

.toggle-label {
    cursor: pointer;
    user-select: none;
    color: var(--text-color);
    font-weight: 600;
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
    margin-top: 10px;
    font-size: 0.85em;
    color: #666;
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
}

.privacy-tip i {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}

.warning-text {
    color: #e74c3c;
    font-weight: 600;
}

/* ======== Responsive ======== */
@media (max-width: 768px) {
  .account-container {
    padding: var(--padding-mobile);
    gap: 1rem;
    overflow-y: auto;
  }

  .main-card {
    padding: var(--padding-mobile);
  }

  .sub-card {
    padding: var(--padding-mobile);
  }
}

@media (max-width: 480px) {
  .account-container {
    padding: 0.75rem;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .main-card {
    padding: 0.875rem;
  }

  .sub-card {
    padding: 0.875rem;
  }

  .action-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  /* Scrollbar más pequeño en móviles */
  .account-container::-webkit-scrollbar {
    width: 6px;
  }
}
</style>