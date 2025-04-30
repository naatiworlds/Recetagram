<template>
  <div class="follow-stats">
    <div class="stat-item" @click="$emit('show-followers')">
      <span class="stat-number">{{ followersCount }}</span>
      <span class="stat-label">seguidores</span>
    </div>
    <div class="separator"></div>
    <div class="stat-item" @click="$emit('show-following')">
      <span class="stat-number">{{ followingCount }}</span>
      <span class="stat-label">siguiendo</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileStats',

  props: {
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['show-followers', 'show-following']
}
</script>

<style scoped>
.follow-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.separator {
  width: 1px;
  height: 30px;
  background-color: var(--border-color);
}

.stat-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .follow-stats {
    width: 100%;
    justify-content: center;
  }
}
</style> 