<template>
    <img :src="frameSrc" alt="Item frame" class="background" />
</template>

<script setup lang="ts">
const frameSrc = '/img/editor/item-frame.png'
</script>

<style scoped>
.background {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
