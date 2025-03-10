<template>
  <div
    ref="itemContainer"
    class="item-container"
    :style="pointerEvents ? 'pointer-events: all' : 'pointer-events: none'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    v-on-long-press="[onLongPressCallback, { delay: 750, distanceThreshold: 24, onMouseUp: onMouseUpCallback}]"
  >
    <img
      :src="equipment.image ? equipment.image : 'img/editor/fallback-icon.webp'"
      class="item-image"
      draggable="false"
    />

    <div
      v-if="isEquipment && showSockets && shouldShowSockets"
      :class="[socketLayoutClass, 'socket-container']"
    >
      <div
        v-for="(socket, index) in (equipment as Equipment).sockets.list.slice(0, maxSockets)"
        :key="index"
        class="socket"
        :style="getSocketPosition(index, (equipment as Equipment).sockets.list.length)"
      >
        <SocketComponent
          :prismatic="socket.prismatic"
          :socketable="socket.socketable"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SocketComponent from "./SocketComponent.vue";
import { BaseItem, Equipment } from "../models/Equipment";
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import type EditorContext from "../models/EditorContext";
import { vOnLongPress } from '@vueuse/components'

@Component({
  name: "ItemComponent",
  components: { SocketComponent, Equipment, vOnLongPress},
  directives: {
      'on-long-press': vOnLongPress
    },
  emits: ["show-tooltip", "hide-tooltip", "item-click"],
})
class ItemComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  @Prop({ type: Object, required: true }) equipment!: BaseItem;
  @Prop({ type: Boolean, required: false }) pointerEvents: boolean = false;
  @Prop({ type: Boolean, required: false }) showSockets: boolean = false;
  
  maxSockets = 16;

  get shouldShowSockets(): boolean {
    if (!this.isEquipment) return false;
    const socketCount = (this.equipment as Equipment).sockets.amount;
    return socketCount <= this.maxSockets;
  }

  onLongPressCallback(e: PointerEvent) {
    e.stopPropagation()
    this.onMouseEnter()
  }

  //@ts-ignore
  onMouseUpCallback(duration: number, distance: number, isLongPress: boolean) {
    if (!isLongPress) {
      this.onItemClick()
    }
  }

  get isEquipment(): boolean {
    return this.equipment instanceof Equipment;
  }

  getSocketPosition(index: number, totalSockets: number): string {
    // For predetermined layouts (1-6 sockets), we use the grid-based layouts
    if (totalSockets <= 6 && this.socketLayoutClass !== "universal-layout") {
      return `grid-area: s${index + 1}`;
    }
    
    // Adjust radius based on socket count to prevent overcrowding
    let outerRadius = 270;
    let innerRadius = 45;
    
    // For higher socket counts, increase the outer radius further
    if (totalSockets > 8) {
      outerRadius = 360;
      innerRadius = 270;
    }
    
    // Determine if we need single or dual ring layout
    const useDoubleRing = totalSockets > 10;
    
    // Calculate position
    let radius = useDoubleRing 
      ? (index < 8 ? outerRadius : innerRadius) 
      : outerRadius;
      
    // Calculate the number of sockets in each ring
    const outerRingCount = Math.min(8, totalSockets);
    const innerRingCount = totalSockets - outerRingCount;
    
    // Calculate angle
    let angle;
    if (useDoubleRing) {
      if (index < outerRingCount) {
        // Outer ring
        angle = index * (360 / outerRingCount);
      } else {
        // Inner ring - offset by half the angle between outer sockets for better distribution
        const innerIndex = index - outerRingCount;
        const angleOffset = 180 / innerRingCount;
        angle = innerIndex * (360 / innerRingCount) + angleOffset;
      }
    } else {
      angle = index * (360 / totalSockets);
    }

    const x = radius * Math.sin(angle * Math.PI / 180);
    const y = -radius * Math.cos(angle * Math.PI / 180);
    
    return `transform: translate(${x}%, ${y}%) rotate(0deg);`;
  }

  emptySockets(): void {
    (this.equipment as Equipment).clearSocketables();
    this.$emit("socket-cleared");
  }

  get socketLayoutClass() {
    const socketCount = (this.equipment as Equipment).sockets.amount;
    if (socketCount === 1) {
      return "one-layout";
    } else if (socketCount === 2) {
      return "two-layout";
    } else if (socketCount === 3) {
      return "three-layout";
    } else if (socketCount === 4) {
      return "four-layout";
    } else if (socketCount === 5) {
      return "five-layout";
    } else if (socketCount === 6) {
      return "six-layout";
    }

    return "universal-layout";
  }
  
  onItemClick() {
    if (!this.equipment) return;
    this.$emit("item-click", this.equipment);
  }

  onMouseEnter() {
    if (!this.equipment) return;
    this.editorContext.updateStatDisplay(this.equipment);
    this.$emit("show-tooltip", this.equipment);
  }

  onMouseLeave() {
    this.editorContext.resetStatDisplay();
    this.$emit("hide-tooltip");
  }

  unmounted() {
    this.editorContext.resetStatDisplay();
    this.$emit("hide-tooltip");
  }
}
export {ItemComponent}
export default toNative(ItemComponent)
</script>

<style scoped>
.item-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  image-rendering: pixelated;
  z-index: 1;
  user-select: none;
  width: 100%;
  height: 100%;
  object-fit: contain;
  scale: 1.5;
  pointer-events: none;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -webkit-user-drag: none; /* Safari */
}

.socket-container {
  display: grid;
  position: absolute;
  z-index: 11;
  justify-content: center;
  grid-row-gap: 1.25rem;
  grid-column-gap: 1.25rem;
  pointer-events: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.universal-layout {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.universal-layout .socket {
  position: absolute;
  transform-origin: center;
}

.one-layout {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  grid-template-areas:
    "s1";
}

.two-layout {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    "s1"
    "s2";
}

.three-layout {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas:
    "s1"
    "s2"
    "s3";
}

.four-layout {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    "s1  s2"
    "s3  s4";
}

.five-layout {
  grid-template-columns: repeat(5, 1.4rem);
  grid-template-rows: repeat(5, 1.7rem);
  grid-template-areas:
    ". . . . ."
    ". s1 . s2 ."
    ". . s3 . ."
    ". s4 . s5 ."
    ". . . . .";
    grid-row-gap: 0.2rem;
    grid-column-gap: 0.2rem;
}

.six-layout {
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: repeat(1, 1fr);
  grid-template-areas:
    "s1  s2"
    "s3  s4"
    "s5  s6";
}
</style>