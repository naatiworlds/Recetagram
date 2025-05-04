<template>
    <section>
        <header>
            <h2>Registro</h2>
        </header>
        <main>
            <div class="separador">
                <div class="linea"></div>
                <div class="circulo">🧑‍🍳</div>
                <div class="linea"></div>
            </div>

            <form @submit.prevent="handleRegister">
                <label>
                    Name:
                    <input type="text" v-model="name" required />
                </label>
                <p v-if="nameError" class="error">{{ nameError }}</p>
                
                <label>
                    Email:
                    <input type="email" v-model="email" required />
                </label>
                <p v-if="emailError" class="error">{{ emailError }}</p>
                
                <label>
                    Contraseña:
                    <div class="password-input-container">
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          v-model="password" 
                          required 
                        />
                        <button type="button" class="toggle-password-button" @click="togglePassword">
                            <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                        </button>
                    </div>
                    <p v-if="passwordError" class="error">{{ passwordError }}</p>
                </label>
                
                <button type="submit" :disabled="loading || nameError || emailError || passwordError">
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
import apiService from '../services/api'
import { useNotificationStore } from '../stores/notification'
import { useUserStore } from '../stores/user'

export default {
    name: 'Register',
    data() {
        return {
            name: '',
            email: '',
            password: '',
            loading: false,
            showPassword: false
        }
    },
    computed: {
        nameError() {
            if (!this.name || this.name.trim().length === 0) {
                return "El nombre es obligatorio.";
            } else if (this.name.trim().length < 3) {
                return "El nombre debe tener al menos 3 caracteres.";
            }
            return null;
        },
        emailError() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!this.email || this.email.trim().length === 0) {
                return "El email es obligatorio.";
            } else if (!emailRegex.test(this.email)) {
                return "Introduce un email válido.";
            }
            return null;
        },
        passwordError() {
            if (this.password && this.password.length > 0 && this.password.length < 6) {
                return "La contraseña debe tener al menos 6 caracteres.";
            }
            return null;
        }
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        async handleRegister() {
            // Si existe error de validación, no se envía el formulario.
            if (this.nameError || this.emailError || this.passwordError) return;
            this.loading = true
            const userStore = useUserStore()
            const notificationStore = useNotificationStore()
            try {
                await apiService.register({
                    name: this.name,
                    email: this.email,
                    password: this.password
                })
                this.$router.push('/home')
                notificationStore.show('Registro exitoso', 'success')
            } catch (error) {
                notificationStore.show(
                    error.message || 'Error al registrarse',
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
.oculto~section{
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  z-index: 1;
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
    color: black;
    border-radius: 6px;
    font-size: 16px;
}

section main form button {
    width: 100%;
    padding: 15px; /* Aumentado el padding del botón */
    margin-top: 1em;
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

/* Estilos para el toggle de contraseña (igual a Login) */
.password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
}
.password-input-container input {
    width: 100%;
  /* Aumenta el padding-right si lo necesitas para que no se superponga el botón */
  padding-right: 40px;
}
.toggle-password-button {
    background: transparent;
    width: 0;
    border: none;
    cursor: pointer;
    outline: none;
    transition: transform 0.3s ease;
    padding: 0 10px;
}
.toggle-password-button:focus {
  transform: translateY(-50%) scale(1.2);
}

/* Media queries */
@media (max-width: 768px) {
    section {
        width: 80%;
        height: fit-content;
    }

    section main {
        padding: 30px;
    }
    section main .separador {
    margin-bottom: 10px;
}
    section main form {
        width: 90%;
        gap: 0;
    }
}
@media (max-width: 600px) {
    section {
        grid-area: var(--main-responsive-area);
    }

    
}
@media (max-width: 480px) {
    section {
        width: 90%;
        margin: 15px auto;
    }
}
.error {
    color: red;
    font-size: 0.9em;
    margin-top: 5px;
}
</style>