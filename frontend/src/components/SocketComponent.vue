<template>
  <img :src="socketImage" class="socket" />
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  prismatic: boolean
}>()

const socketImage = computed(() =>
  props.prismatic ? '/img/editor/socket-prismatic.png' : '/img/editor/socket-normal.png'
)
</script>

<style scoped>
.socket {
  width: 36px;
  height: 36px;
}
</style>
