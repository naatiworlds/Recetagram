<template>
    <header id="header">
        <div id="icon-container" class="logoAndMenu">
            <img :src="imagen" alt="Logo" width="50px">

            <div class="menu-toggle" @click="toggleMenu">
                <i class="fas fa-bars"></i>
            </div>
        </div>

        <div class="icon-group">
            <div class="notification-wrapper" @click="toggleNotifications">
                <i class="fa-solid fa-bell fa-lg notificaciones"></i>
                <span v-if="userNotifications.unreadCount" class="notification-badge">
                    {{ userNotifications.unreadCount }}
                </span>
            </div>
        </div>

        <NotificationModal :is-open="showNotifications" @close="toggleNotifications" />
    </header>
</template>

<script>
import { DEFAULT_AVATAR_URL } from '../utils/globalConstants'
import logo from "../assets/descarga.png"
import setupTheme from "../utils/changeLightDark"
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { useUserNotificationStore } from '../stores/interactionNotifications'
import NotificationModal from '../components/NotificationModal.vue'
import { apiService } from '../services/api'

export default {
    name: 'Header',

    components: {
        NotificationModal
    },

    data() {
        return {
            imagen: logo,
            showNotifications: false,
            avatarUrl: DEFAULT_AVATAR_URL,
            userStore: useUserStore(),
            notificationStore: useNotificationStore(),
            userNotifications: useUserNotificationStore()
        }
    },
    beforeUnmount() {
        this.userNotifications.destroyRealtime()
    },

    watch: {
        'userStore.user': {
            immediate: true,
            handler(user) {
                const resolvedUserId = user?.id
                if (resolvedUserId) {
                    this.userNotifications.fetchNotifications()
                    this.userNotifications.requestNotificationPermission()
                    this.userNotifications.startBackgroundRefresh()
                    this.userNotifications.initRealtime(resolvedUserId)
                    return
                }

                this.userNotifications.destroyRealtime()
            }
        }
    },

    methods: {

        toggleMenu() {
            this.$emit('toggle-menu')
        },

        async toggleNotifications() {
            this.showNotifications = !this.showNotifications
            if (this.showNotifications) {
                try {
                    const response = await apiService.getNotifications()
                    if (response.data.status === 'success') {
                        this.notificationStore.show(
                            'Notificaciones actualizadas',
                            'success',
                            3000
                        )
                    }
                } catch (error) {
                    this.notificationStore.show(
                        'Error al cargar las notificaciones',
                        'error',
                        5000
                    )
                }
            }
        }
    },
}
</script>


<style scoped>
header {
    grid-area: var(--header-area);
    background-color: var(--primary-color);
    color: var(--text-color-important);
    padding: var(--espaciado);
    text-align: center;
    width: 100%;
    z-index: 1000;
    height: var(--header-height);
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
}

#icon-container {
    display: flex;
    justify-content: center;
    gap: 1em;
    align-content: stretch;
    flex-wrap: wrap;
    align-items: center;
}

.icon-group {
    display: flex;
    align-items: center;
    gap: 1em;
}

header h1 {
    margin: 0;
    font-size: 1.8em;
}

header a {
    color: var(--text-color-important);
    text-decoration: none;
}

header .fa-lg {
    cursor: pointer;
    font-size: 2em;
}

.notification-wrapper {
    position: relative;
    cursor: pointer;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--contrast-color);
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    min-width: 18px;
    text-align: center;
    z-index: 1001;
}

.notifications-modal {
    position: fixed;
    top: 60px;
    right: 20px;
    background: var(--complementary-color);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    max-height: 400px;
    z-index: 1000;
    overflow: hidden;
}

.notifications-content {
    padding: 15px;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--sombra-color);
}

.close-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-color);
}

.notifications-list {
    max-height: 300px;
    overflow-y: auto;
}

.notification-item {
    padding: 10px;
    border-bottom: 1px solid var(--sombra-color);
    cursor: pointer;
}

.notification-item:hover {
    background: var(--primary-color);
}

.notification-item.unread {
    background: var(--primary-color);
    font-weight: bold;
}

.notification-content {
    display: flex;
    flex-direction: column;
}

.notification-message {
    font-size: 1em;
}

.notification-time {
    font-size: 0.8em;
    color: var(--text-color);
    margin-top: 5px;
}

.no-notifications {
    padding: 20px;
    text-align: center;
    color: var(--text-color);
}

.menu-toggle {
    cursor: pointer;
    padding: 8px;
}

.menu-toggle i {
    font-size: 1.5rem;
    color: var(--text-color-important);
}

/* Media queries para responsividad */
@media (max-width: 768px) {
    #header {
        padding: 10px;
    }

    header h1 {
        font-size: 1.5em;
    }

    .icon-group {
        gap: 0.8em;
    }

    .icon-group img {
        width: 40px;
    }

    header .fa-lg {
        font-size: 1.8em;
    }

    .wrap {
        transform: scale(0.9);
    }
}

@media (max-width: 480px) {
    #header {
        padding: 8px;
    }

    header h1 {
        font-size: 1.2em;
    }

    .icon-group {
        gap: 0.6em;
    }

    .icon-group img {
        width: 35px;
    }

    header .fa-lg {
        font-size: 1.6em;
    }

    .wrap {
        transform: scale(0.8);
    }

    #icon-container {
        gap: 0.5em;
    }

    .notification-badge {
        font-size: 0.8em;
        padding: 2px 6px;
    }
}

/* Ocultar el icono de mensajes por defecto */
.mensaje {
    display: none;
}

/* Mostrar el icono de mensajes solo en pantallas menores a 600px */
@media (max-width: 600px) {
    .mensaje {
        display: inline-block;
    }
    .fa-bars{
        display: none;
    }
}
</style>