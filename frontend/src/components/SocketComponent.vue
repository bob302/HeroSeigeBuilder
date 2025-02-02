<template>
  <img :src="socketImage" class="socket" />
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  enhanced: boolean
}>()

const socketImage = computed(() =>
  props.enhanced ? '/img/editor/socket-enhanced.png' : '/img/editor/socket-normal.png'
)
</script>

<style scoped>
.socket {
  width: 36px;
  height: 36px;
}
</style>
