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
      <!-- Si está en modo de edición, mostrar el input -->
      <div v-if="isEditing" class="edit-name">
        <input 
          type="text" 
          v-model="editedName" 
          class="edit-input"
          @keyup.enter="saveName"
          @keyup.esc="cancelEdit"
          ref="nameInput"
        >
        <button @click="saveName">✓</button>
        <button @click="cancelEdit">✗</button>
      </div>
      <!-- Si no está en edición, mostrar el nombre normal -->
      <h3 v-else>{{ user.name }}</h3>

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
    isEditing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['start-editing', 'update-name', 'cancel-edit'],

  data() {
    return {
      editedName: this.user?.name || ''
    }
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

    startEditing() {
      this.$emit('start-editing');  // Emitimos el evento al componente padre para cambiar el estado
    },

    saveName() {
      if (this.editedName.trim() && this.editedName !== this.user.name) {
        this.$emit('update-name', this.editedName.trim());  // Emitir el nuevo nombre
      } else {
        this.$emit('cancel-edit');  // Si no hay cambio, cancelar la edición
      }
    },

    cancelEdit() {
      this.editedName = this.user.name;  // Restablecer el nombre original
      this.$emit('cancel-edit');  // Emitir evento de cancelación
    }
  },
  
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

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-item {
    justify-content: center;
  }
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  font-size: 1.2rem;
  color: var(--text-color);
  background-color: var(--background-color);
}

.edit-input:focus {
  outline: none;
  border-color: var(--contrast-color);
  box-shadow: 0 0 0 2px rgba(0, 196, 180, 0.2);
}
</style>