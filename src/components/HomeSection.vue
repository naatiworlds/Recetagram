<template>
    <div>

    </div>
</template>

<script>
    export default {
        name: 'HomeSection'
    }
</script>

<style >
#app {
  margin: 0;
  padding: 0;
  background-color: var(--complementary-color);
  display: grid;
  width: 100%;
  height: 100vh;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  grid-template-columns: var(--columns-grid);
  grid-template-rows: var(--rows-grid);
  overflow-y: hidden;
}

body::-webkit-scrollbar {
  display: none;
}

</style>