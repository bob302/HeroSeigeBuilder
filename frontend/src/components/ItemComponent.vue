<template>
  <div class="item-container" :style="pointerEvents ? 'pointer-events: all' : 'pointer-events: none'"
      @mouseenter="this.onMouseEnter"
      @mouseleave="this.onMouseLeave">
    <!-- Отображаем изображение предмета, если оно есть -->
    <img v-if="this.equipment.image" :src="this.equipment.image" class="item-image"  />

    <!-- Отображение сокетов -->
    <div v-if="(this.equipment.sockets.amount) || this.showSockets" :class="[this.socketLayoutClass, 'socket-container']">
      <div v-for="(socket, index) in this.equipment.sockets.list.slice(0, 6)" :key="index"
        :class="['socket', `socket-${index + 1}`]">
        <SocketComponent :prismatic="socket.prismatic" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SocketComponent from './SocketComponent.vue'
import { Equipment } from '../models/Equipment'
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  components: {SocketComponent},
  emits: ['item-on-mouse-enter', 'item-on-mouse-leave']
})
export default class ItemComponent extends Vue {
  @Prop({ type: Object, required: true }) equipment!: Equipment;
  @Prop({ type: Boolean, required: false}) pointerEvents: boolean = false
  @Prop({ type: Boolean, required: false}) showSockets: boolean = false
  
  get socketLayoutClass() {
    const socketCount = this.equipment.sockets.amount
    if (socketCount === 1) {
      return 'single-layout'
    } else if (socketCount % 2 === 0) {
      return 'even-layout'
    } else {
      return 'odd-layout'
    }
  }

  onMouseEnter(event: MouseEvent) {
    if (!this.equipment) return
    this.$emit("item-on-mouse-enter", {equipment: this.equipment, pos: {x: event.x, y: event.y}})
  }

  onMouseLeave(event: MouseEvent) {
    this.$emit("item-on-mouse-leave")
  }
}
</script>

<style scoped>
.item-container {
  position: relative;
  width: 100%;
  height: 100%;
  top: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Стили для предмета */
.item-image {
  scale: 125%;
  image-rendering: pixelated;
  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
  z-index: 1;
}


/* Стили для контейнера сокетов */
.socket-container {
  display: grid;
  justify-content: center;
  align-items: center;
  position: absolute;
  max-height: 100%;
  max-width: 100%;
  top: 0%;
  gap: 0;
  pointer-events: none;
  z-index: 11;
}

/* Примеры классов для разных раскладок сокетов */
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
  grid-template-rows: repeat(1, 1fr);
  grid-template-areas:
    "s1  s2"
    "s3  s4"
    "s5  s6";
  grid-column-gap: 0.2em;
}

.odd-layout {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(5, 1fr);
  grid-template-areas:
    "s1  s2"
    "s3  s3"
    "s4  s5";
  grid-column-gap: 0.3em;
}

.socket-1 { grid-area: s1; }
.socket-2 { grid-area: s2; }
.socket-3 { grid-area: s3; }
.socket-4 { grid-area: s4; }
.socket-5 { grid-area: s5; }
.socket-6 { grid-area: s6; }
</style>
