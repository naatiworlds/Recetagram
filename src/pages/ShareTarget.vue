<template>
  <main class="share-target-page">
    <Crear v-if="isReady" :initial-shared-data="sharedData" @close="handleClose" />
  </main>
</template>

<script>
import Crear from '../components/Crear.vue'

export default {
  name: 'ShareTarget',
  components: {
    Crear,
  },
  data() {
    return {
      isReady: false,
      sharedData: {
        title: '',
        text: '',
        url: '',
      },
    }
  },
  created() {
    const query = this.$route.query || {}
    this.sharedData = {
      title: String(query.title || ''),
      text: String(query.text || ''),
      url: String(query.url || ''),
    }

    this.isReady = true
  },
  methods: {
    handleClose() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.share-target-page {
  min-height: 100vh;
}
</style>
