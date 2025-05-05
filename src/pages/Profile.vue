<template>
    <div class="container">
        <div v-if="loading" class="loading">
            Cargando perfil...
        </div>
        <div v-else-if="error" class="error">
            {{ error }}
        </div>
        <section v-else-if="user" class="profile">
            <header>
                <h2>{{ isOwnProfile ? 'Mi Perfil' : user.name }}</h2>
            </header>
            <main>
                <div class="profile-container">
                    <ProfileHeader :user="user" :loading="loading" :is-editing="isEditing"
                        @update-name="handleUpdateName" @cancel-edit="handleCancel" @start-editing="startEditing" />

                    <ProfileStats :followers-count="followersCount" :following-count="followingCount" />

                    <div class="user-info">
                        <ProfilePrivacy v-if="isOwnProfile" :user-id="user.id" :is-public="user.is_public"
                            :loading="loading" :is-own-profile="isOwnProfile" @update="handlePrivacyUpdate" />

                        <ProfileActions :is-own-profile="isOwnProfile" :is-admin="userStore.user?.role === 'admin'"
                            :key="`action-${isFollowing}`" :is-following="isFollowing" :loading="loading"
                            :user-id="user?.id" @follow="handleFollow" @unfollow="handleUnfollow"
                            @admin="goToAdminPanel" @delete="showDeleteModal = true" />
                    </div>
                </div>

                <div v-if="isOwnProfile" class="profile-actions">
                    <template v-if="isEditing">
                        <button class="save-button" @click="handleSave" :disabled="loading">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                        <button class="cancel-button" @click="handleCancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </template>
                    <template v-else>
                        <button class="edit-button" @click="startEditing">
                            <i class="fas fa-edit"></i> Editar
                        </button>

                        <button class="delete-button" @click="confirmDelete">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </template>
                </div>
            </main>

            <DeleteConfirmationModal v-if="showDeleteModal" @confirm="handleDelete" @cancel="showDeleteModal = false" />
        </section>

        <!-- Sección de posts -->
        <section v-if="user" class="profile-posts">
            <div v-if="canViewPosts">
                <header>
                    <h3>{{ isOwnProfile ? 'Mis Posts' : `Posts de ${user.name}` }}</h3>
                </header>
                <Posts :user-id="userId" :is-profile-view="true" :is-own-profile="isOwnProfile"
                    @edit-post="handleEditPost" />
                <Crear v-if="showPostModal" :post-to-edit="postToEdit" @close="handleModalClose" />
            </div>
            <div v-else class="private-profile-message">
                <i class="fas fa-lock"></i>
                <p>Este perfil es privado</p>
                <p>Sigue a este usuario para ver sus posts</p>
            </div>
        </section>


    </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { apiService } from '../services/api'
import { STORAGE_URL } from '../utils/globalConstants'

import Posts from '../components/Posts.vue'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import ProfileStats from '../components/ProfileStats.vue'
import ProfileActions from '../components/ProfileActions.vue'
import ProfilePrivacy from '../components/ProfilePrivacy.vue'
import Crear from '../components/Crear.vue'


export default {
    name: 'Profile',

    components: {
        ProfileHeader,
        ProfileStats,
        ProfileActions,
        ProfilePrivacy,
        Posts,
        DeleteConfirmationModal,
        Crear
    },

    data() {
        return {
            user: null,
            loading: false,
            error: null,
            showDeleteModal: false,
            isEditing: false,
            isFollowing: false,
            isPendingFollow: false,
            followersCount: 0,
            followingCount: 0,
            showPostModal: false,
            postToEdit: null,
        }
    },

    computed: {
        ...mapStores(useUserStore, useNotificationStore),

        userId() {
            return this.$route.params.id || this.userStore.user?.id
        },

        isOwnProfile() {
            return this.user && this.userStore.user && (this.userStore.user.id === this.user.id);
        },

        isAdmin() {
            return this.userStore.user?.role === 'admin'
        },

        canViewPosts() {
  if (this.isOwnProfile) return true;
  return this.user?.is_public || this.isFollowing;
}

    },

    methods: {
        waitForUser() {
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    if (this.userStore.user) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        },

        getInitials(name) {
            if (!name) return ''
            return name.split(' ').map(word => word[0].toUpperCase()).join('')
        },

        formatDate(date) {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },

        getProfileImage(image) {
            return image ? `${STORAGE_URL}/${image}` : null
        },

        handleEdit() {
            this.$emit('edit-post', post)
        },
        startEditing() {
            this.isEditing = true;
        },
        async handleUpdateName(newName) {
            try {
                this.loading = true
                const response = await apiService.updateUser(this.userId, {
                    name: newName,
                    is_private: this.user.is_private
                })
                if (response.data?.data) {
                    this.user = response.data.data
                    this.isEditing = false
                    this.notificationStore.show('Nombre actualizado correctamente', 'success')
                }
            } catch (error) {
                this.notificationStore.show('Error al actualizar el nombre', 'error')
            } finally {
                this.loading = false
            }
        },

        handleCancel() {
            this.isEditing = false
            this.loadUserProfile()
        },

        async handlePrivacyUpdate(newState) {
    if (!this.user || this.loading) return;
    try {
        this.loading = true;
        const updatedUser = await apiService.updateUser(this.user.id, {
            is_public: newState
        });

        if (updatedUser.data) {
            this.user.is_public = newState;

            // ✅ Mostrar notificación amigable
            const statusMsg = newState ? 'Tu perfil ahora es público' : 'Tu perfil ahora es privado';
            this.notificationStore.show(statusMsg, 'success');
        }
    } catch (error) {
        this.notificationStore.show('Error al actualizar la privacidad', 'error');
    } finally {
        this.loading = false;
    }
},

        goToAdminPanel() {
            this.$router.push('/admin')
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

        async handleFollow(userId) {
            try {
                this.loading = true;
                const response = await apiService.followUser(userId);  // Lógica para seguir
                if (response?.data?.data.status === 'accepted') {
                    this.isFollowing = true  // Actualizar el estado de 'isFollowing'
                    const followInfo = await apiService.getFollowData(this.userId);
                    if (followInfo?.data) {
                        this.followersCount = followInfo.data?.data.followers_count;
                        this.followingCount = followInfo.data?.data.following_count;
                    }
                }
            } catch (error) {
            } finally {
                this.loading = false;
            }
        },
        async handleUnfollow(userId) {
            try {
                this.loading = true;
                const response = await apiService.unfollowUser(userId);
                if (response?.data?.status === "success") {
                    this.isFollowing = false;  // Actualizar el estado de 'isFollowing'
                    const followInfo = await apiService.getFollowData(this.userId);
                    if (followInfo?.data) {
                        this.followersCount = followInfo.data?.data.followers_count;
                        this.followingCount = followInfo.data?.data.following_count;
                    }
                }
            } catch (error) {
            } finally {
                this.loading = false;
            }
        },

        async loadUserProfile() {
            this.loading = true
            this.error = null

            // Si no viene ID en la ruta, usamos el userStore.currentUser.id
            const routeId = this.$route.params.id
            const targetId = routeId || this.userStore.user?.id

            try {
                // Cargar datos
                const response = await apiService.getUser(targetId)
                
                this.user = response.data.data

                // Llamada para obtener si estamos siguiendo al usuario
                const followInfo = await apiService.getFollowData(this.userId);
                if (followInfo?.data) {
                    this.followersCount = followInfo.data?.data.followers_count;
                    this.followingCount = followInfo.data?.data.following_count;
                }
                const checkFollow = await apiService.getFollowStatus(this.userId)
                if (checkFollow.data.data.status === "accepted") {
                    this.isFollowing = true
                }
            } catch (err) {
                this.error = err?.message || 'Error al cargar el perfil'
                this.notificationStore.show('Error al cargar el perfil', 'error')
            } finally {
                this.loading = false
            }
        },
        handleEditPost(post) {
            // Al recibir el post desde el evento, abrir el modal
            this.postToEdit = post;
            this.showPostModal = true;
        },

        handleModalClose() {
            // Cerrar el modal
            this.showPostModal = false;
            this.postToEdit = null;
        },

    },

    async mounted() {
        await this.loadUserProfile();
    },

    watch: {
        
        '$route.params.id': {
            immediate: true,
            handler() {
                this.loadUserProfile()
            }
        }
    },
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
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 20px;
    /* Añade padding para el scrollbar */
}

.container::-webkit-scrollbar {
    display: none;
    /* Oculta en Chrome, Edge y Safari */
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

.follow-stats {
    display: flex;
    gap: 10px;
    margin-top: 10px;
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


/* Media queries */
@media (max-width: 768px) {


    .profile main {
        flex-direction: column;
    }

    .actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 15px;
        flex-wrap: wrap;
    }
}

@media (max-width: 600px) {
    .container {
        grid-area: var(--main-responsive-area);
    }
}

@media (max-width: 480px) {


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

.profile-privacy {
    margin-top: 20px;
    padding: 15px;
    background-color: var(--secundary-color);
    border-radius: 8px;
}

.toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.switch-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.toggle-label {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    font-size: 12px;
}

.toggle-switch input:checked+.toggle-label {
    background-color: var(--contrast-color);
}

.toggle-label:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

.toggle-switch input:checked+.toggle-label:before {
    transform: translateX(26px);
}

.follow-button {
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.follow-button.follow {
    background-color: var(--primary-color);
    color: white;
}

.follow-button.unfollow {
    background-color: var(--contrast-color);
    color: white;
}

.follow-button.pending {
    background-color: var(--warning-color);
    color: white;
    cursor: not-allowed;
}

.follow-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.follow-button i {
    font-size: 14px;
}

@media (max-width: 768px) {
    .follow-button {
        margin-top: 1rem;
        width: 100%;
        justify-content: center;
    }
}

.privacy-tip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin-left: 10px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch-container:hover .privacy-tip {
    opacity: 1;
    visibility: visible;
}

.privacy-tip i {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}
.green-heart {
  color: var(--primary-color);
}

.white-heart {
  color: white;
}
</style>