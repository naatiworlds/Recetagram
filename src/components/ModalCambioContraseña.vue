<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cambiar Contraseña</h3>
                <button class="close-button" @click="$emit('close')">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <form @submit.prevent="handleSubmit">
                    <!-- Contraseña actual -->
                    <div class="form-group password-group">
                        <label for="current">Contraseña actual</label>
                        <div class="input-wrapper">
                            <input id="current" :type="show.current ? 'text' : 'password'" v-model="form.current"
                                required placeholder="Contraseña actual" class="name-input" />
                            <button type="button" class="toggle-password" @click="show.current = !show.current">
                                <i :class="show.current ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Nueva contraseña -->
                    <div class="form-group password-group">
                        <label for="new">Nueva contraseña</label>
                        <div class="input-wrapper">
                            <input id="new" :type="show.new ? 'text' : 'password'" v-model="form.new" required
                                placeholder="Nueva contraseña" class="name-input" />
                            <button type="button" class="toggle-password" @click="show.new = !show.new">
                                <i :class="show.new ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirmar contraseña -->
                    <div class="form-group password-group">
                        <label for="confirm">Confirmar nueva contraseña</label>
                        <div class="input-wrapper">
                            <input id="confirm" :type="show.confirm ? 'text' : 'password'" v-model="form.confirm"
                                required placeholder="Repite nueva contraseña" class="name-input" />
                            <button type="button" class="toggle-password" @click="show.confirm = !show.confirm">
                                <i :class="show.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <div v-if="error" class="error">{{ error }}</div>
                </form>
            </div>

            <div class="modal-footer">
                <button class="cancel-button" type="button" @click="$emit('close')">
                    Cancelar
                </button>
                <button class="confirm-button" type="submit" :disabled="loading" @click="handleSubmit">
                    Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { apiService } from '@/services/api'

export default {
    name: 'ModalCambioContraseña',

    data() {
        return {
            form: {
                current: '',
                new: '',
                confirm: '',
            },
            show: {
                current: false,
                new: false,
                confirm: false,
            },
            loading: false,
            error: '',
            userStore: null,
            notificationStore: null,
        }
    },

    created() {
        this.userStore = useUserStore()
        this.notificationStore = useNotificationStore()
    },

    methods: {
        async handleSubmit() {
            this.error = ''

            if (this.form.new !== this.form.confirm) {
                this.error = 'Las contraseñas no coinciden'
                return
            }

            if (this.form.new.length < 6) {
                this.error = 'La nueva contraseña debe tener al menos 6 caracteres'
                return
            }

            try {
                this.loading = true

                await apiService.updateUser(this.userStore.user.id, {
                    password: this.form.new,
                })

                this.notificationStore.show('Contraseña actualizada correctamente', 'success')
                this.$emit('close')
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al cambiar la contraseña'
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
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
    background-color: var(--primary-color);
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: modal-appear 0.3s ease-out;
}

.modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.2rem;
}

.close-button {
    background: none;
    border: none;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s;
}

.close-button:hover {
    color: var(--text-color);
}

.modal-body {
    padding: 2rem;
    text-align: center;


}

form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-end;
}

.form-group {
    display: flex;
    flex-direction: row;
    gap: 1em;
}

.warning-icon {
    font-size: 3rem;
    color: var(--sombra-color);
    margin-bottom: 1rem;
}

.warning-text {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 0.5rem;
}

.name-input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    color: var(--text-color);
}

.warning-subtext {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
}

.password-group {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  background: none;
  border: none;
  position: absolute;
  right: 5px;
  color: var(--text-color-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.toggle-password:hover {
  color: var(--text-color);
}

.error {
    display: block;
    color: var(--contrast-color);
    font-size: 14px;
    margin-top: 5px;
    width: 90%;
}

.modal-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.modal-footer button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
}

.cancel-button {
    background-color: var(--secundary-color);
    color: var(--text-color);
}

.cancel-button:hover {
    background-color: var(--background-color-tertiary);
}

.confirm-button {
    background-color: var(--contrast-color);
    color: white;
}

.confirm-button:hover {
    background-color: var(--error-color-dark);
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 1rem;
    }

    .modal-footer {
        flex-direction: column-reverse;
    }

    .modal-footer button {
        width: 100%;
        justify-content: center;
    }
}
</style>