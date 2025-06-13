<template>
  <div class="profile-header">
    <div class="avatar">
      <div class="avatar-circle" :style="{ backgroundColor: user?.color || '#00C4B4' }">
        {{ getInitials(user.name) }}
      </div>
      <span v-if="user?.role" :class="['role-badge', user.role.toLowerCase()]">
        {{ user.role }}
      </span>
    </div>
    
    <div class="user-info">
      
      <h3>{{ user.name }}</h3>

      <div class="info-item">
        <label>Miembro desde:</label>
        <p>{{ formatCreatedAt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    user: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    
  },

  computed: {
    formatCreatedAt() {
      if (!this.user?.created_at) return 'Fecha no disponible';
      const date = new Date(this.user.created_at);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  },

  methods: {
    getInitials(name) {
      return name ? name.split(' ').map(word => word[0].toUpperCase()).join('') : '';
    },

    
  }
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item label {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: var(--text-color);
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.delete-button {
  background-color: #ff4757;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.delete-button:hover {
  background-color: #ff6b81;
  transform: translateY(-1px);
}

/* Efectos de click */

.delete-button:active {
  transform: translateY(1px);
}
</style>