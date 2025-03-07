<template>
  <div class="admin-dashboard">
    <div class="admin-tabs">
      <h2>Panel de Administración</h2>
      <nav class="admin-nav">
        <router-link to="/admin/users" class="admin-tab">
          <i class="fas fa-users"></i> Usuarios
        </router-link>
        <router-link to="/admin/posts" class="admin-tab">
          <i class="fas fa-file-alt"></i> Posts
        </router-link>
        <router-link to="/admin/comments" class="admin-tab">
          <i class="fas fa-comments"></i> Comentarios
        </router-link>
      </nav>
    </div>
    
    <main class="admin-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  grid-area: var(--main-area);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
  background-color: var(--background-color);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.admin-tabs {
  background-color: var(--secundary-color);
  padding: 15px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
}

.admin-tabs h2 {
  color: var(--text-color-important);
  margin-bottom: 15px;
  font-size: 1.5em;
  text-align: center;
}

.admin-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

.admin-tab {
  padding: 10px 20px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  flex: 1;
  justify-content: center;
  max-width: 200px;
  text-align: center;
}

.admin-tab:hover,
.admin-tab.router-link-active {
  background-color: var(--primary-color);
  color: var(--text-color-important);
  transform: translateY(-3px);
}

.admin-tab i {
  width: 20px;
  text-align: center;
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-x: hidden;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .admin-tabs {
    padding: 10px;
  }
  
  .admin-tabs h2 {
    font-size: 1.2em;
    margin-bottom: 10px;
  }
  
  .admin-tab {
    padding: 8px 15px;
    font-size: 14px;
    max-width: none;
  }
  
  .admin-content {
    padding: 10px;
  }
}

@media (min-width: 768px) {
  .admin-tabs {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .admin-tabs h2 {
    margin-bottom: 0;
    flex: 1;
  }
  
  .admin-nav {
    justify-content: flex-end;
    flex: 2;
  }
}
</style> 