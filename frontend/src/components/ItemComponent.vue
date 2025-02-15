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
        <SocketComponent 
          :prismatic="socket.prismatic" 
          :socketable="socket.socketable"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SocketComponent from './SocketComponent.vue'
import { Equipment, Socketable } from '../models/Equipment'
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  components: {SocketComponent},
  emits: ['item-on-mouse-enter', 'item-on-mouse-leave']
})
export default class ItemComponent extends Vue {
  @Prop({ type: Object, required: true }) equipment!: Equipment;
  @Prop({ type: Boolean, required: false}) pointerEvents: boolean = false
  @Prop({ type: Boolean, required: false}) showSockets: boolean = false


insertSocketable(socketable: Socketable) {
  const sockets = [...this.equipment.sockets.list]; // Create a new array
  const index = sockets.findIndex(s => !s.socketable);
  
  if (index !== -1) {
    sockets[index] = { ...sockets[index], socketable }; // Create new object
    this.equipment.sockets.list = sockets; // Replace array reference
    this.$emit('socket-inserted', socketable);
    return true;
  }
  return false;
}

  emptySockets(): void {
    this.equipment.clearSocketables()
    this.$emit('socket-cleared');
  }

  get socketLayoutClass() {
    const socketCount = this.equipment.sockets.amount
    if (socketCount === 1) {
      return 'one-layout'
    } else if (socketCount === 2) {
      return 'two-layout'
    } else if (socketCount === 3) {
      return 'three-layout'
    } else if (socketCount === 4) {
      return 'four-layout'
    } else if (socketCount === 5) {
      return 'five-layout'
    } else if (socketCount === 6) {
      return 'six-layout'
    }
  }

  onMouseEnter(event: MouseEvent) {
    if (!this.equipment) return
    this.$emit("item-on-mouse-enter", {equipment: this.equipment, pos: {x: event.x, y: event.y}})
  }

  onMouseLeave(event: MouseEvent) {
    this.$emit("item-on-mouse-leave")
  }
  public get _VLS_template() {
    return this.__VLS_template;
  }
  public set _VLS_template(value) {
    this.__VLS_template = value;
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



.socket-container {
  display: grid;
  position: absolute;
  gap: 0;
  pointer-events: none;
  z-index: 11;
  place-items: center;
}

/* Примеры классов для разных раскладок сокетов */
.one-layout {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    "."
    "s1"
    ".";
}

.two-layout {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas:
    "."
    "s1"
    "s2"
    ".";
}

.three-layout {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    "."
    "s1"
    "s2"
    "s3"
    ".";
}

.four-layout {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas:
    ". ."
    "s1  s2"
    "s3  s4"
    ". .";
  grid-column-gap: 0.2em;
}

.five-layout {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    ". . ."
    "s1 . s2"
    ". s3 ."
    "s4 . s5"
    ". . .";
  grid-column-gap: 0.2em;
}

.six-layout {
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: repeat(1, 1fr);
  grid-template-areas:
    "s1  s2"
    "s3  s4"
    "s5  s6";
  grid-column-gap: 0.2em;
}



.socket-1 { grid-area: s1; }
.socket-2 { grid-area: s2; }
.socket-3 { grid-area: s3; }
.socket-4 { grid-area: s4; }
.socket-5 { grid-area: s5; }
.socket-6 { grid-area: s6; }
</style>
