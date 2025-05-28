<template>
  <div class="profile-actions">
    <!-- Botón de follow/unfollow para perfiles ajenos -->
    <button
      v-if="!isOwnProfile"
      @click="handleClick"
      :class="['follow-button', { 'following': isFollowing, 'pending': isPendingFollow }]"
      :disabled="loading || isPendingFollow"
    >
      <template v-if="isPendingFollow">
        <i class="fas fa-clock"></i> Pendiente
      </template>
      <template v-else>
        {{ isFollowing ? 'Dejar de seguir' : 'Seguir' }}
      </template>
    </button>

    <!-- Botones para perfil propio -->
    <template v-if="isOwnProfile">
      <button v-if="isAdmin" class="admin-button" @click="$emit('admin')">
        <i class="fas fa-cogs"></i> Panel Admin
      </button>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ProfileActions',

  props: {
    isOwnProfile: {
      type: Boolean,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true
    },
    isFollowing: {
      type: Boolean,
      default: false
    },
    isPendingFollow: {
      type: Boolean,
      default: false // Estado reactivo para solicitudes pendientes
    },
    loading: {
      type: Boolean,
      default: false
    },
    userId: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['follow', 'unfollow', 'admin', 'delete'],

  methods: {
    handleClick() {
      if (this.isPendingFollow) {
        return; // No hacer nada si la solicitud está pendiente
      }

      if (this.isFollowing) {
        this.$emit('unfollow', this.userId);
      } else {
        this.$emit('follow', this.userId);
      }
    }
  }
};
</script>

<style scoped>
.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.follow-button,
.admin-button,
.delete-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-button {
  background-color: var(--primary-color);
  color: white;
}

.follow-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.follow-button.unfollow {
  background-color: var(--background-color-secondary);
  color: var(--text-color);
}

.follow-button.unfollow:hover:not(:disabled) {
  background-color: var(--error-color);
  color: white;
}

.follow-button.pending {
  background-color: var(--background-color-secondary);
  color: var(--text-color-secondary);
  cursor: not-allowed;
}

.follow-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-button {
  background-color: var(--contrast-color);
  color: white;
}

.admin-button:hover {
  background-color: var(--contrast-color-dark);
}

.delete-button {
  background-color: var(--error-color);
  color: white;
}

.delete-button:hover {
  background-color: var(--error-color-dark);
}

.admin-actions {
  display: flex;
  gap: 1rem;
}

@media (max-width: 768px) {
  .profile-actions {
    justify-content: center;
    width: 100%;
  }

  .admin-actions {
    flex-direction: column;
    width: 100%;
  }

  .follow-button,
  .admin-button,
  .delete-button {
    width: 100%;
    justify-content: center;
  }
}
</style>