<template>
  <div class="explorar-container">
    <div class="explorar-filters">
      <label for="searchTerm">Buscar Término: </label>
      <input v-model="filters.searchTerm" id="searchTerm" placeholder="Ej: para toda la familia" />

      <button @click="resetFilters">Resetear filtros</button>
    </div>
    <div class="posts-wrapper">
      <Posts :filters="filters" :is-explorar="true" :key="$route.path" />
    </div>
  </div>
</template>

<script>
import Posts from '../components/Posts.vue'

export default {
  components: {
    Posts,
  },
  data() {
    return {
      // Ahora se incluye el filtro de ingrediente en lugar del de fecha
      filters: this.getDefaultFilters()
    }
  },
  methods: {
    getDefaultFilters() {
      return {
        searchTerm: '',
      };
    },
    resetFilters() {
      this.filters = this.getDefaultFilters();
    }
  }
}
</script>

<style scoped>
.explorar-container {
  grid-area: var(--main-area);
  width: 100%;
  overflow-x: hidden;
}

.oculto~.explorar-container {
  position: absolute;
  top: 9%;
  width: 100%;
  z-index: 1;
}

.explorar-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espaciado);
  margin-bottom: var(--espaciado);
  padding: var(--espaciado);

}

.explorar-filters input,
.explorar-filters select {
  flex: 1;
  min-width: 200px;
  padding: calc(var(--espaciado) / 2);
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background-color: var(--complementary-color);
  color: var(--text-color);
}
.explorar-filters button{
  background-color: var(--primary-color);
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

}
@media (max-width: 600px) {
  .explorar-container {
    grid-area: var(--main-responsive-area);
    padding-bottom: var(--mobile-nav-height);
    box-sizing: border-box;
  }
}
</style>