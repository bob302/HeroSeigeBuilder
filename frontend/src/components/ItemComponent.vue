<template>
  <div
    class="item-container"
    :style="pointerEvents ? 'pointer-events: all' : 'pointer-events: none'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <img
      :src="equipment.image ? equipment.image : 'img/editor/fallback-icon.webp'"
      class="item-image"
      draggable="false"
    />

    <div
      v-if="isEquipment && showSockets"
      :class="[socketLayoutClass, 'socket-container']"
    >
      <div
        v-for="(socket, index) in (
          equipment as Equipment
        ).sockets.list.slice(0, 6)"
        :key="index"
        :class="['socket', `socket-${index + 1}`]"
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
import { BaseItem, Equipment, Socketable } from "../models/Equipment";
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import type EditorContext from "../models/EditorContext";

@Component({
  components: { SocketComponent, Equipment },
  emits: ["item-on-mouse-enter", "item-on-mouse-leave"],
})
class ItemComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  @Prop({ type: Object, required: true }) equipment!: BaseItem;
  @Prop({ type: Boolean, required: false }) pointerEvents: boolean = false;
  @Prop({ type: Boolean, required: false }) showSockets: boolean = false;

  get isEquipment(): boolean {
    return this.equipment instanceof Equipment;
  }

  insertSocketable(socketable: Socketable) {
    if (!(this.equipment instanceof Equipment)) return;
    const sockets = [...(this.equipment as Equipment).sockets.list];
    const index = sockets.findIndex((s) => !s.socketable);

    if (index !== -1) {
      sockets[index] = { ...sockets[index], socketable };
      (this.equipment as Equipment).sockets.list = sockets;
      this.$emit("socket-inserted", socketable);
      return true;
    }
    return false;
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
  }

  onMouseEnter() {
    if (!this.equipment) return;
    this.editorContext.updateStatDisplay(this.equipment);
    this.$emit("item-on-mouse-enter", this.equipment);
  }

  onMouseLeave() {
    this.editorContext.resetStatDisplay();
    this.$emit("item-on-mouse-leave");
  }
}

export default toNative(ItemComponent)
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

.item-image {
  scale: 125%;
  image-rendering: pixelated;
  transition:
    transform 0.5s ease-in-out,
    filter 0.5s ease-in-out;
  z-index: 1;
  user-select: none;

  max-width: 100%;
  max-height: 100%;
}

.socket-container {
  display: grid;
  position: absolute;
  gap: 0;
  pointer-events: none;
  z-index: 11;
  place-items: center;
}

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

.socket-1 {
  grid-area: s1;
}
.socket-2 {
  grid-area: s2;
}
.socket-3 {
  grid-area: s3;
}
.socket-4 {
  grid-area: s4;
}
.socket-5 {
  grid-area: s5;
}
.socket-6 {
  grid-area: s6;
}
</style>
