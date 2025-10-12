<template>
    <div class="account-container">
      <!-- Card principal de Editar Usuario -->
      <div class="main-card edit-user-card">
        <h3 class="card-title">Editar Usuario</h3>
        
        <!-- Sub-card para Cambiar nombre -->
        <div class="sub-card change-name-card">
          <h4 class="sub-card-title">Cambiar nombre</h4>
          <p class="sub-card-description">Esta acción cambiará el nombre que los usuarios verán al buscarte</p>
          <button v-if="isAuthenticated" class="action-button edit-button" @click.prevent="showNameModal = true">
            <i class="fas fa-edit"></i> Editar usuario
          </button>
        </div>
            </div>

      <!-- Card separado para Cerrar sesión -->
      <div class="main-card logout-card">
        
        
        <!-- Sub-card para Cerrar sesión -->
        <div class="sub-card logout-sub-card">
            <h3 class="sub-card-title">Cerrar sesión</h3>
          <p class="sub-card-description">Esta acción cerrará tu sesión hasta que vuelva a iniciarla</p>
          <button v-if="isAuthenticated" class="action-button logout-button" @click.prevent="handleLogout">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
            </div>
        </div>

      <!-- Modal para cambiar nombre -->
      <ChangeNameModal v-if="showNameModal" v-model="user.name" @confirm="updateUser"
          @cancel="showNameModal = false" />
    </div>
</template>

<script>
import { useUserStore } from '../../stores/user.js';
import { useNotificationStore } from '../../stores/notification.js';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/api';
import ChangeNameModal from '@/components/ChangeNameModal.vue';

export default {
    name: 'Account',
    components: { ChangeNameModal },
    data() {
        return {
            user: {
                name: ''
            },
            showNameModal: false,
            userStore: null,
            notificationStore: null,
            router: null
        };
    },
    created() {
        this.userStore = useUserStore();
        this.notificationStore = useNotificationStore();
        this.router = useRouter();
        this.user.name = this.userStore.user?.name || '';
    },
    computed: {
        isAuthenticated() {
            return this.userStore?.isAuthenticated;
        }
    },
    methods: {
        async updateUser() {
            try {
                const response = await apiService.updateUser(this.userStore.user.id, {
                    name: this.user.name
                });
                if (response.data?.data) {
                    this.userStore.setUser(response.data.data);
                    this.notificationStore.show('Nombre actualizado correctamente', 'success');
                    this.showNameModal = false;
                }
            } catch (error) {
                this.notificationStore.show('Error al actualizar el nombre', 'error');
            }
        },
        handleLogout() {
            this.userStore.logout();
            this.notificationStore.show('Has cerrado sesión correctamente', 'success', 3000);
            this.router.push('/login');
        }
    }
};
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

.edit-user-card {
  background: var(--complementary-color);
}

.logout-card {
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

.change-name-card {
  background: var(--secundary-color);
}

.logout-sub-card {
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

.edit-button {
  background: var(--primary-color);
  color: var(--complementary-color);
}

.edit-button:hover {
  background: var(--contrast-color);
  transform: translateY(-1px);
}

.logout-button {
  background: var(--sombra-color);
  color: var(--text-color-important);
}

.logout-button:hover {
  background: var(--sombra-color);
  transform: translateY(-1px);
}

/* ======== Responsive ======== */
@media (max-width: 768px) {
  .account-container {
    padding: var(--padding-mobile);
    padding-bottom: 1.5rem;
    gap: 1rem;
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
    padding-bottom: 1.25rem;
    gap: 0.75rem;
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