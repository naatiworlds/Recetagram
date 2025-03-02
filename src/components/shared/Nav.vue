<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/" class="nav-logo">Recetagram</router-link>
    </div>
    <div class="nav-links">
      <router-link to="/" class="nav-item">Inicio</router-link>
      <router-link to="/explorar" class="nav-item">Explorar</router-link>
      <router-link to="/contacto" class="nav-item">Contacto</router-link>
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login" class="nav-item">Iniciar Sesión</router-link>
        <router-link to="/register" class="nav-item">Registrarse</router-link>
      </template>
      <a v-else @click="logout" class="nav-item">Cerrar Sesión</a>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-logo {
  text-decoration: none;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-item {
  text-decoration: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #333;
}
</style>
