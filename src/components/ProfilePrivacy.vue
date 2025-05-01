<template>
  <div v-if="isOwnProfile" class="info-item profile-privacy">
    <label>Privacidad del perfil:</label>
    <div class="toggle-switch">
      <div class="switch-container">
        <!-- Usamos checkedValue para invertir la visualización -->
        <input type="checkbox" :id="'privacy-toggle-' + userId" :checked="checkedValue" @change="handlePrivacyChange" :disabled="loading">
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
</template>

<script>
export default {
  name: 'ProfilePrivacy',

  props: {
    userId: {
      type: [Number, String],
      required: true
    },
    isPublic: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    isOwnProfile: {
      type: Boolean,
      required: true
    }
  },

  emits: ['update'],

  computed: {
    // Si el perfil es público (isPublic true) mostramos el checkbox sin marcar;
    // si es privado (isPublic false) el checkbox se marca.
    checkedValue() {
      return !this.isPublic;
    }
  },

  methods: {
    handlePrivacyChange(e) {
      if (!this.loading) {
        // El nuevo estado del checkbox (true cuando está marcado) se invierte
        const newCheckboxState = e.target.checked; // true => perfil privado
        const newIsPublic = !newCheckboxState;
        console.log('🔒 ProfilePrivacy - Toggle privacidad:', {
          userId: this.userId,
          currentIsPublic: this.isPublic,
          newIsPublic
        });
        // Emitir el nuevo valor para actualizar el perfil
        this.$emit('update', newIsPublic);
      }
    }
  }
}
</script>

<style scoped>
.profile-privacy {
  margin-top: 1rem;
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
  cursor: pointer;
  user-select: none;
  color: var(--text-color);
}

input[type="checkbox"] {
  position: relative;
  width: 50px;
  height: 25px;
  -webkit-appearance: none;
  background-color: var(--background-color-secondary);
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

@media (max-width: 768px) {
  .profile-privacy {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-switch {
    justify-content: center;
  }

  .privacy-tip {
    display: none;
  }
}
</style>