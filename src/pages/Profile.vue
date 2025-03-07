<template>
    <div class="container">

        <section v-if="user" class="profile">
            <header>
                <h2>Perfil de Usuario</h2>
            </header>
            <main>
                <div class="profile-container">
                    <div class="avatar">
                        <!-- Avatar por defecto o inicial del nombre -->
                        <div class="avatar-circle">
                            {{ getInitials }}
                        </div>
                        <span v-if="isAdmin" class="role-badge admin">Admin</span>
                        <span v-else class="role-badge user">Usuario</span>
                    </div>

                    <div class="user-info">
                        <div v-if="user.name" class="info-item">
                            <label>Nombre:</label>
                            <input v-if="isEditing" v-model="editedUser.name" type="text" class="edit-input">
                            <p v-else>{{ user.name }}</p>
                        </div>
                        <div v-if="user.email" class="info-item">
                            <label>Email:</label>
                            <input v-if="isEditing" v-model="editedUser.email" type="email" class="edit-input">
                            <p v-else>{{ user.email }}</p>
                        </div>
                        <div v-if="user.role" class="info-item">
                            <label>Rol:</label>
                            <p>{{ user.role }}</p>
                        </div>
                        <div v-if="user.created_at" class="info-item">
                            <label>Miembro desde:</label>
                            <p>{{ formatDate(user.created_at) }}</p>
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <template v-if="isEditing">
                        <button class="save-button" @click="handleSave">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                        <button class="cancel-button" @click="handleCancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </template>
                    <template v-else>
                        <button class="edit-button" @click="handleEdit">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button v-if="isAdmin" class="admin-button" @click="goToAdminPanel">
                            <i class="fas fa-cogs"></i> Panel Admin
                        </button>
                        <button class="delete-button" @click="confirmDelete">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </template>
                </div>
            </main>

            <!-- Modal de confirmación -->
            <div v-if="showDeleteModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>¿Estás seguro?</h3>
                    <p>Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede
                        deshacer.</p>
                    <div class="modal-actions">
                        <button class="cancel-button" @click="showDeleteModal = false">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button class="delete-button" @click="handleDelete">
                            <i class="fas fa-trash-alt"></i>
                            Sí, eliminar mi cuenta
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <section v-else>
            <header>
                <h2>Cargando perfil...</h2>
            </header>
        </section>
        <section class="profile-posts">
            <!-- Sección para mostrar los posts del usuario -->
            <div class="profile-posts">
                <header>
                    <h3>Mis Posts</h3>
                </header>
                <UserPosts :userId="user.id" />
            </div>
        </section>
    </div>

</template>

<script>
import UserPosts from '../components/UserPosts.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { useRouter } from 'vue-router'

export default {
    name: 'Profile',
    components: { UserPosts },
    data() {
        return {
            user: null,
            isEditing: false,
            editedUser: {
                name: '',
                email: ''
            },
            showDeleteModal: false
        }
    },
    computed: {
        getInitials() {
            if (!this.user || !this.user.name) return ''

            return this.user.name.split(' ')
                .map(word => word[0].toUpperCase())
                .join('')
        },
        isAdmin() {
            return this.user?.role?.toLowerCase() === 'admin'
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
        async fetchUserProfile() {
            const authStore = useAuthStore()
            const notificationStore = useNotificationStore()

            if (!authStore.isAuthenticated) {
                notificationStore.showNotification(
                    'Debes iniciar sesión para ver tu perfil',
                    'error'
                )
                this.$router.push('/login')
                return
            }

            try {
                console.log('Solicitando perfil de usuario...')
                const response = await authStore.getUserProfile()
                console.log('Datos del usuario recibidos:', response)

                // La respuesta tiene formato { status, message, data }
                // Necesitamos extraer los datos del usuario de data
                if (response && response.data) {
                    this.user = response.data
                    console.log('Perfil de usuario establecido:', this.user)
                } else {
                    throw new Error('No se recibieron datos del usuario')
                }
            } catch (error) {
                console.error('Error en fetchUserProfile:', error)
                notificationStore.showNotification(
                    'Error al cargar el perfil: ' + error.message,
                    'error'
                )

                // Solo redirigir a login si es un error de autenticación
                if (error.response?.status === 401) {
                    this.$router.push('/login')
                }
            }
        },
        handleEdit() {
            this.editedUser = {
                name: this.user.name,
                email: this.user.email
            }
            this.isEditing = true
        },

        async handleSave() {
            const authStore = useAuthStore()
            const notificationStore = useNotificationStore()

            try {
                await authStore.updateProfile(this.editedUser)
                this.user = { ...this.user, ...this.editedUser }
                this.isEditing = false
                notificationStore.showNotification('Perfil actualizado correctamente', 'success')
            } catch (error) {
                notificationStore.showNotification(
                    error.message || 'Error al actualizar el perfil',
                    'error'
                )
            }
        },

        handleCancel() {
            this.isEditing = false
            this.editedUser = {
                name: this.user.name,
                email: this.user.email
            }
        },

        confirmDelete() {
            this.showDeleteModal = true
        },

        async handleDelete() {
            const authStore = useAuthStore()
            const notificationStore = useNotificationStore()
            const router = useRouter()

            try {
                await authStore.deleteAccount()
                notificationStore.showNotification(
                    'Tu cuenta ha sido eliminada correctamente',
                    'success'
                )
                router.push('/login')
            } catch (error) {
                notificationStore.showNotification(
                    error.message || 'Error al eliminar la cuenta',
                    'error'
                )
            } finally {
                this.showDeleteModal = false
            }
        },
        goToAdminPanel() {
            this.$router.push('/admin')
        }
    },
    async created() {
        const authStore = useAuthStore()
        authStore.initializeAuth() // Aseguramos que la autenticación esté inicializada
        await this.fetchUserProfile()
    }
}
</script>

<style scoped>
.oculto~.container {
    position: absolute;
    top: 9%;
    left: 5%;
    width: 90%;
    z-index: 1;
}

.container {
    grid-area: var(--main-area);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
    padding-right: 8px;
    /* Añade padding para el scrollbar */
}

/* Estilo para el scrollbar */
.container::-webkit-scrollbar {
    width: 8px;
}

.container::-webkit-scrollbar-track {
    background: var(--complementary-color);
    border-radius: 4px;
}

.container::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
    transition: background 0.3s ease;
}

.container::-webkit-scrollbar-thumb:hover {
    background: var(--contrast-color);
}

/* Asegurarse de que funcione en Firefox */
.container {
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--complementary-color);
}

.profile {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 1em 0;
}

section {
    background-color: var(--secundary-color);
    border-radius: 10px;
    width: 100%;
    height: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 1em 0;
}

header {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 20px;
    text-align: center;
    /* display: none; */
    width: 100%;
}

header h2 {
    color: var(--text-color-important);
    font-size: 24px;
}

main {
    /* padding: 40px; */
    flex: 1;
    display: flex;
    /* flex-direction: column; */
    width: 100%;
    justify-content: space-around;
}

.profile-container {
    display: flex;
    flex-direction: row;
    gap: 30px;
    align-content: center;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin: 1em 0;
}

.avatar {
    position: relative;
    margin-bottom: 20px;
}

.avatar-circle {
    width: 50px;
    height: 50px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: var(--text-color);
    font-weight: bold;
}

.role-badge {
    position: absolute;
    bottom: -5px;
    right: -22px;
    padding: 2px 6px;
    border-radius: 13px;
    font-size: 0.8em;
    font-weight: bold;
}

.role-badge.admin {
    background-color: var(--contrast-color);
    color: var(--text-color);
}

.role-badge.user {
    background-color: var(--sombra-color);
    color: var(--text-color);
}

.user-info {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 20px;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item label {
    font-weight: bold;
    color: var(--text-color-important);
    font-size: 14px;
    margin-bottom: 5px;
}

.info-item p {
    font-size: 16px;
    color: var(--text-color-important);
    padding: 15px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid var(--sombra-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.profile-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-direction: column;
}

.profile-actions button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.edit-button {
    background-color: var(--primary-color);
    color: var(--text-color-important);
}

.edit-button:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-1px);
}

.delete-button {
    background-color: #ff4757;
    color: white;
}

.delete-button:hover {
    background-color: #ff6b81;
    transform: translateY(-1px);
}

/* Efectos de click */
.edit-button:active,
.delete-button:active {
    transform: translateY(1px);
}

.edit-input {
    width: 100%;
    padding: 15px;
    border: 1px solid var(--sombra-color);
    border-radius: 6px;
    font-size: 16px;
    background-color: white;
    color: var(--text-color-important);
}

.save-button {
    background-color: #4CAF50;
    color: white;
}

.save-button:hover {
    background-color: #45a049;
    transform: translateY(-1px);
}

.cancel-button {
    background-color: #808080;
    color: white;
}

.cancel-button:hover {
    background-color: #6f6f6f;
    transform: translateY(-1px);
}

.admin-button {
    background-color: var(--sombra-color);
    color: black;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.admin-button:hover {
    background-color: var(--contrast-color);
}

/* .admin-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background-color: var(--contrast-color);
    color: white;
    padding: 2px 6px;
    border-radius: 13px;
    font-size: 0.8em;
} */

/* Media queries */
@media (max-width: 768px) {
    section {
        width: 90%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}

@media (max-width: 480px) {
    section {
        width: 95%;
    }

    main {
        padding: 20px;
    }

    .avatar-circle {
        width: 100px;
        height: 100px;
        font-size: 36px;
    }

    .profile-actions {
        flex-direction: column;
        padding: 0 10px;
    }

    .profile-actions button {
        width: 100%;
        justify-content: center;
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: var(--secundary-color);
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
    color: var(--text-color-important);
    font-size: 24px;
    margin-bottom: 20px;
}

.modal-content p {
    color: var(--text-color);
    margin-bottom: 30px;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 20px;
    justify-content: flex-end;
}

.modal-actions button {
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}

.modal-actions .delete-button {
    background-color: #ff4757;
    color: white;
}

.modal-actions .delete-button:hover {
    background-color: #ff6b81;
    transform: translateY(-1px);
}

.modal-actions .cancel-button {
    background-color: #808080;
    color: white;
}

.modal-actions .cancel-button:hover {
    background-color: #6f6f6f;
    transform: translateY(-1px);
}

@media (max-width: 480px) {
    .modal-content {
        width: 95%;
        padding: 20px;
    }

    .modal-actions {
        flex-direction: column;
    }

    .modal-actions button {
        width: 100%;
        justify-content: center;
    }
}
</style>