<template>
  <div
    class="container"
    @mousemove="updateTooltipPosition"
    @mouseenter="showStats = true"
    @mouseleave="hideStats"
  >
    <!-- Frame -->
    <img :src="frameSrc" alt="Item frame" class="background" />
    <!-- Item -->
    <img v-if="image" :src="image" class="item" />
    <!-- Sockets -->
    <div v-if="sockets.length" class="grid-container">
      <SocketComponent v-for="(socket, index) in sockets.slice(0, 6)" :key="index" :enhanced="socket.enhanced" />
    </div>
  </div>
  <ItemStatsComponent
    v-if="showStats"
    :name="name"
    :type="type"
    :subtype="subtype"
    :combined-item-type="combinedType"
    :rarity="rarity"
    :stats="stats"
    :tier="tier"
    :one-handed="oneHanded"
    :x="tooltipX"
    :y="tooltipY"
    :level="level"
  />
</template>

<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'
import SocketComponent from './SocketComponent.vue'
import ItemStatsComponent from './ItemStatsComponent.vue'
import { Stat } from '@/models/Equipment'

const props = defineProps<{
  image?: string
  name: string
  type: string
  subtype: string
  rarity: string
  oneHanded: boolean
  stats: Stat[]
  tier: string
  level: string
  sockets: { enhanced: boolean }[]
}>()

const frameSrc = '/img/editor/item-frame.png'
const showStats = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)

const combinedType = computed(() => {
  return `${props.rarity} ${props.subtype}`
})

const updateTooltipPosition = (event: MouseEvent) => {
  tooltipX.value = event.clientX + 15
  tooltipY.value = event.clientY + 15
}

const hideStats = () => {
  showStats.value = false
}
</script>

<style scoped>
.container {
  position: relative;
  max-width: 124px;
  max-height: 184px;
}

.background {
  width: 100%;
  height: 100%;
}

.item {
  position: absolute;
  width: 80%;
  height: 80%;
  object-fit: contain;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
