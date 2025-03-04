<template>
    <section v-if="user">
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
                    <span v-if="user.role" class="role-badge" :class="user.role">
                        {{ user.role }}
                    </span>
                </div>

                <div class="user-info">
                    <div v-if="user.name" class="info-item">
                        <label>Nombre:</label>
                        <p>{{ user.name }}</p>
                    </div>
                    <div v-if="user.email" class="info-item">
                        <label>Email:</label>
                        <p>{{ user.email }}</p>
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
        </main>
    </section>
    <section v-else>
        <header>
            <h2>Cargando perfil...</h2>
        </header>
    </section>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { useRouter } from 'vue-router'

export default {
    name: 'Profile',
    data() {
        return {
            user: null
        }
    },
    computed: {
        getInitials() {
            if (!this.user || !this.user.name) return ''
            
            return this.user.name.split(' ')
                .map(word => word[0].toUpperCase())
                .join('')
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
                const userData = await authStore.getUserProfile()
                console.log('Datos del usuario recibidos:', userData)
                
                // Verificamos que tengamos los datos necesarios
                if (!userData || !userData.id) {
                    throw new Error('No se recibieron datos del usuario')
                }
                
                this.user = userData
            } catch (error) {
                console.error('Error en fetchUserProfile:', error)
                notificationStore.showNotification(
                    error.message || 'Error al cargar el perfil',
                    'error'
                )
                this.$router.push('/login')
            }
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
section {
    grid-area: var(--main-area);
    background-color: var(--secundary-color);
    border-radius: 10px;
    width: 600px;
    height: auto;
    min-height: 600px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

header {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 20px;
    text-align: center;
}

header h2 {
    color: var(--text-color-important);
    font-size: 24px;
}

main {
    padding: 40px;
    flex: 1;
}

.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.avatar {
    position: relative;
    margin-bottom: 20px;
}

.avatar-circle {
    width: 120px;
    height: 120px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: var(--text-color);
    font-weight: bold;
}

.role-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 14px;
    text-transform: capitalize;
}

.role-badge.admin {
    background-color: var(--contrast-color);
    color: var(--text-color);
}

.role-badge.user {
    background-color: var(--primary-color);
    color: var(--text-color);
}

.user-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
}
</style> 