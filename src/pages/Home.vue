<template>
      <Header />
      <Nav />
      <Posts />
  </template>
  
  <script>
  import Header from '../components/Header.vue';
  import Nav from '../components/Nav.vue';
  import Posts from '../components/Posts.vue';

  export default {
    components: {
      Header,
      Nav,
      Posts
    }
  };
  </script>
  
  <style lang="scss" scoped>
  
  </style>
  