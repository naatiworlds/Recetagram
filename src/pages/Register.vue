<template>
    <section>
        <header>
            <h2>Iniciar sesión</h2>
        </header>
        <main>
            <div class="separador">
                <div class="linea"></div>
                <div class="circulo">🧑‍🍳</div>
                <div class="linea"></div>
            </div>

            <form @submit.prevent="handleLogin">
                <label>
                    Name:
                    <input type="text" v-model="name" required />
                </label>
                <label>
                    Email:
                    <input type="email" v-model="email" required />
                </label>
                <label>
                    Contraseña:
                    <input type="password" v-model="password" required />
                </label>
                <button type="submit" :disabled="loading">
                    {{ loading ? 'Cargando...' : 'Registrarse' }}
                </button>
            </form>

            <p class="registro">
                ¿Ya tienes cuenta? <a href="/login">Logueate</a>
            </p>
        </main>
    </section>


</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

export default {
    name: 'Login',
    data() {
        return {
            name: '',
            email: '',
            password: '',
            loading: false
        }
    },
    methods: {
        async handleLogin() {
            this.loading = true
            const authStore = useAuthStore()
            const notificationStore = useNotificationStore()
            try {
                await authStore.login(this.email, this.password)
                this.$router.push('/home')
                notificationStore.showNotification('Inicio de sesión exitoso', 'success')
            } catch (error) {
                notificationStore.showNotification(
                    error.message || 'Error al iniciar sesión',
                    'error'
                )
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
section {
    grid-area: var(--main-area);
    background-color: var(--secundary-color);
    border-radius: 10px;
    width: 600px;
    height: 600px;
    margin: auto auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

section header {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 20px;
    text-align: center;
}

section header h2 {
    font-size: 24px;
    color: var(--text-color-important);
}

section main {
    padding: 50px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

section main .separador {
    display: flex;
    flex-direction: row;
    margin-bottom: 30px;
    align-items: center;
    width: 100%;
}

section main .separador .linea {
    flex: 1;
    height: 1px;
    background-color: var(--text-color-important);
    opacity: 0.3;
}

section main .separador .circulo {
    padding: 0 20px;
    font-size: 24px;
}

section main form {
    display: flex;
    flex-direction: column;
    gap: 30px;
    align-items: center;
    width: 80%;
    margin: 0 auto;
}

section main form label {
    width: 100%;
    text-align: left;
}

section main form input {
    width: 100%;
    padding: 15px;
    margin-top: 8px;
    border: 1px solid var(--sombra-color);
    border-radius: 6px;
    font-size: 16px;
}

section main form button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    background: var(--contrast-color);
    color: var(--text-color);
    transition: background-color 0.2s;
}

section main form button:hover {
    opacity: 0.9;
}

.registro {
    text-align: center;
    margin-top: 20px;
    font-size: 16px;
}

.registro a {
    color: var(--contrast-color);
    text-decoration: none;
    font-weight: 500;
}

.registro a:hover {
    text-decoration: underline;
}

/* Media queries */
@media (max-width: 768px) {
    section {
        width: 80%;
        height: auto;
        min-height: 600px;
    }

    section main {
        padding: 30px;
    }

    section main form {
        width: 90%;
    }
}

@media (max-width: 480px) {
    section {
        width: 90%;
        margin: 15px auto;
    }
}
</style>