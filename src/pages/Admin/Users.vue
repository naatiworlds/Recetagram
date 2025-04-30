<template>
  <div class="admin-page">
    <h2>Gestión de Usuarios</h2>

    <div class="admin-filters">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar usuarios..." 
        class="search-input"
      />
      <select v-model="roleFilter" class="filter-select">
        <option value="">Todos los roles</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>
    </div>

    <div v-if="loading" class="loading-message">
      <p>Cargando usuarios...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchUsers" class="btn-primary">
        <i class="fas fa-sync"></i> Reintentar
      </button>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-message">
      <p v-if="searchTerm || roleFilter">No se encontraron usuarios con los filtros actuales.</p>
      <p v-else>No hay usuarios disponibles.</p>
    </div>

    <div v-else class="admin-cards-container">
      <div v-for="user in filteredUsers" :key="user.id" class="admin-card">
        <div class="card-header">
          <div class="user-avatar">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <h3>{{ user.name }}</h3>
        </div>

        <div class="card-body">
          <div class="card-field">
            <span class="field-label">Email:</span>
            <span class="field-value">{{ user.email }}</span>
          </div>

          <div class="card-field">
            <span class="field-label">Rol:</span>
            <span class="field-value role-badge" :class="user.role">
              {{ user.role === 'admin' ? 'moderator' : user.role }}
            </span>
          </div>

          <div class="card-field">
            <span class="field-label">Fecha de registro:</span>
            <span class="field-value">{{ formatDate(user.created_at) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button @click="modifyRole(user)" class="btn-primary">
            <i class="fas fa-user-edit"></i> Modificar Rol
          </button>
          <button @click="deleteUser(user.id)" class="btn-error">
            <i class="fas fa-trash"></i> Borrar
          </button>
          <button @click="viewUser(user)" class="btn-view">
            <i class="fas fa-eye"></i> Ver Usuario
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '../../services/api'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/user'

export default {
  name: 'UsersManagement',

  data() {
    return {
      users: [],
      searchTerm: '',
      roleFilter: '',
      loading: true,
      error: null,
      notificationStore: useNotificationStore(),
      userStore: useUserStore(),
    }
  },

  computed: {
    filteredUsers() {
      return this.users
        .filter(user => user.id !== this.userStore.user?.id)
        .filter(user => {
          const matchesSearch =
            user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
          const matchesRole = !this.roleFilter || user.role === this.roleFilter
          return matchesSearch && matchesRole
        })
    }
  },

  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const { data } = await apiService.getUsers()
        this.users = data.data || []
      } catch (err) {
        this.error = 'No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo más tarde.'
        this.notificationStore.showNotification('Error al cargar usuarios', 'error')
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId) {
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

      try {
        await apiService.deleteUser(userId)
        this.users = this.users.filter(user => user.id !== userId)
        this.notificationStore.showNotification('Usuario eliminado con éxito', 'success')
      } catch (err) {
        this.notificationStore.showNotification('Error al eliminar usuario', 'error')
      }
    },

    async modifyRole(user) {
      const newRole = user.role === 'user' ? 'admin' : 'user'
      const confirmMessage =
        user.role === 'user'
          ? `¿Estás seguro de que quieres convertir a ${user.name} en moderator?`
          : `¿Estás seguro de que quieres quitar los privilegios de moderator a ${user.name}?`

      if (!confirm(confirmMessage)) return

      try {
        await apiService.updateUser(user.id, { role: newRole })
        user.role = newRole
        this.notificationStore.showNotification(`Rol de ${user.name} actualizado con éxito`, 'success')
      } catch (err) {
        this.notificationStore.showNotification('Error al modificar rol', 'error')
      }
    },

    viewUser(user) {
      window.location.href = `/profile/${user.id}`
    },

    formatDate(date) {
      if (!date) return 'Fecha desconocida'

      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  },

  created() {
    this.fetchUsers()
  }
}
</script>


<style scoped>
.admin-page {
  width: 100%;
  padding: var(--espaciado);
  overflow-x: hidden;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaciado);
  margin-bottom: var(--espaciado);
}

.admin-filters input,
.admin-filters select {
  flex: 1;
  min-width: 200px;
  padding: calc(var(--espaciado) / 2);
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background-color: var(--complementary-color);
  color: var(--text-color);
}

/* Estilos para las tarjetas */
.admin-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.admin-card {
  background-color: var(--secundary-color);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 50px;
  height: 50px;
  background-color: var(--contrast-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-body {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-weight: 600;
  color: var(--text-color-muted);
  font-size: 0.9rem;
}

.field-value {
  color: var(--text-color);
}

.role-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  max-width: fit-content;
}

.role-badge.admin {
  background-color: #ff9800;
  color: white;
}

.role-badge.user {
  background-color: #2196F3;
  color: white;
}

.card-actions {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.card-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-color-important);
}

.btn-error {
  background-color: #ff5252;
  color: white;
}

.btn-view {
  background-color: var(--contrast-color);
  color: white;
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 30px;
  background-color: var(--secundary-color);
  border-radius: 10px;
  margin-top: 20px;
}

.error-message {
  color: #ff5252;
}

.error-message button {
  margin-top: 15px;
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: var(--text-color-important);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }

  .admin-filters {
    flex-direction: column;
  }

  .admin-filters input,
  .admin-filters select {
    width: 100%;
    max-width: none;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .admin-cards-container {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .admin-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 