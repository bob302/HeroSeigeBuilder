<template>
  <div
    class="container"
    @click="saveItem"
    :class="{ saved: isSaved }"
  >
    <!-- Frame -->
    <img :src="frameSrc" alt="Item frame" class="background" />
    <!-- Item -->
    <img v-if="item.image" :src="item.image" class="item"
      @mouseover="showTooltip"
      @mouseleave="hideStats" />
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

const color = computed(() => {
  switch (props.item.rarity) {
    case 'Satanic': return '#c81717'
    case 'Angelic': return '#fdfea5'
    case 'Unholy': return '#c73664'
    case 'Heroic': return '#00e19a'
    case 'Set': return '#0bb01a'
    default: return '#ffffff'
  }
})

const isSaved = ref(false)

const saveItem = () => {
  const json = JSON.stringify(props.item, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    isSaved.value = true
    setTimeout(() => {
      isSaved.value = false
    }, 500) // Сбрасываем эффект через 0.5 сек
  })
}

</script>

<style scoped>
.container {
  position: relative;
  max-width: 124px;
  max-height: 184px;
  pointer-events: none;
  overflow: hidden;
}

.container:hover {
  overflow: visible;
}

.container.saved {
  animation: savedEffect 2s ease-out;
}

@keyframes savedEffect {
  0% { filter: hue-rotate(90deg);}
  50% { filter: hue-rotate(180deg); }
  100% { filter: hue-rotate(270deg); }
}

.background {
  width: 100%;
  height: 100%;
}

.item {
  position: absolute;
  object-fit: fill;
  top: 50%;
  left: 45%;
  scale: 150%;
  image-rendering: pixelated;
  transform: translate(-25%, -25%);
  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
  pointer-events: auto;
  z-index: 1;
}

.item:hover {
  transform: scale(100%, 100%) scale(1.5) translate(-20%, -20%);
  filter: drop-shadow(0.5rem 0.5rem 2rem v-bind(color));
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
    ". . ."
    "s1 . s2"
    "s3 . s4"
    "s5 . s6"
    ". . .";
  grid-column-gap: 0.2em;
}

.odd-layout {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    ". . ."
    "s1 . s2"
    "s3 s3 s3"
    "s4 . s5"
    ". . .";
    grid-column-gap: 0.3em;
}

.socket-1 { grid-area: s1; }
.socket-2 { grid-area: s2; }
.socket-3 { grid-area: s3; }
.socket-4 { grid-area: s4; }
.socket-5 { grid-area: s5; }
.socket-6 { grid-area: s6; }

@media (max-width: 768px) {
  .container.saved {
    animation: none;
  }
  .item:hover {
    transform: translate(-25%, -25%);
    filter: none;
  }
}
</style>
