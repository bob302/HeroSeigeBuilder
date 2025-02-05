<template>
  <div
    class="container"
    @mouseover="showTooltip"
    @mouseleave="hideStats"
  >
    <!-- Frame -->
    <img :src="frameSrc" alt="Item frame" class="background" />
    <!-- Item -->
    <img v-if="item.image" :src="item.image" class="item" />
    <!-- Sockets -->
    <div v-if="item.sockets.amount && showStats || showSockets " :class="socketLayoutClass" class="socket-container">
      <div
        v-for="(socket, index) in item.sockets.list.slice(0, 6)"
        :key="index"
        :class="['socket', `socket-${index + 1}`]"
      >
        <SocketComponent :prismatic="socket.prismatic"/>
      </div>
    </div>
  </div>
  <ItemStatsComponent
    v-if="showStats"
    :item="item"
    :pos="tooltipPosition"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SocketComponent from './SocketComponent.vue'
import ItemStatsComponent from './ItemStatsComponent.vue'
import { Equipment } from '../models/Equipment'

const props = defineProps<{
  item: Equipment
  showSockets: boolean
  x: number
  y: number
}>()

const frameSrc = '/img/editor/item-frame.png'
const showStats = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })

const showTooltip = (event: MouseEvent) => {
  tooltipPosition.value = {
    x: event.clientX + 15,
    y: event.clientY + 15
  }
  showStats.value = true
}

const hideStats = () => {
  showStats.value = false
}

const socketLayoutClass = computed(() => {
  const socketCount = props.item.sockets.amount
  if (socketCount === 1) {
    return 'single-layout'
  } else if (socketCount % 2 === 0) {
    return 'even-layout'
  } else {
    return 'odd-layout'
  }
})
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
  width: 75%;
  height: 75%;
  object-fit: contain;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  image-rendering: pixelated;
  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
}

.item:hover {
  transform: translate(-50%, -50%) scale(1.1);
  filter: brightness(1.2); 
}

.socket-container {
  display: grid;
  position: absolute;

  top: 50%;
  left: 50%; 
  transform: translate(-50%, -50%);
  gap: 0px;
  pointer-events: none;
  z-index: 2;
}

.single-layout {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    ". . ."
    ". s1 ."
    ". . .";
}

.even-layout {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    "s1 . s2"
    "s3 . s4"
    "s5 . s6";
  grid-column-gap: 0.2em;
}

.odd-layout {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    "s1 . s2"
    "s3 s3 s3"
    "s4 . s5";
    grid-column-gap: 0.3em;
}

.socket-1 { grid-area: s1; }
.socket-2 { grid-area: s2; }
.socket-3 { grid-area: s3; }
.socket-4 { grid-area: s4; }
.socket-5 { grid-area: s5; }
.socket-6 { grid-area: s6; }
</style>
