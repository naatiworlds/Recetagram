<template>
    <div class="modal-overlay" @click.self="$emit('cancel')">
        <div class="modal-content">
            <header class="modal-header">
                <h3>Cambiar Nombre</h3>
                <button class="close-button" @click="$emit('cancel')">
                    <i class="fas fa-times"></i>
                </button>
            </header>

            <div class="modal-body">
                <i class="fas fa-user-edit warning-icon"></i>
                <p class="warning-text">Ingresa tu nuevo nombre de usuario</p>
                <input v-model="newName" type="text" placeholder="Nuevo nombre" class="name-input" />
            </div>

            <footer class="modal-footer">
                <button class="cancel-button" @click="$emit('cancel')">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="confirm-button" @click="submit">
                    <i class="fas fa-check"></i>
                    Guardar Cambios
                </button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChangeNameModal',
    props: {
        modelValue: String
    },
    emits: ['update:modelValue', 'confirm', 'cancel'],
    data() {
        return {
            newName: this.modelValue
        };
    },
    methods: {
        submit() {
            this.$emit('update:modelValue', this.newName);
            this.$emit('confirm');
        }
    }
};
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