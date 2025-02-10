<template>
  <div class="slot-container" :style="style">
    <div 
    v-if="!slotData.onCursor" 
    class="slot-content"
    @click="onClick"
    @mouseenter="this.onMouseEnter"
    @mouseleave="this.onMouseLeave"
  >
    <Item 
      v-if="slotData.item?.data" 
      :equipment="slotData.item?.data" 
      :show-sockets="true" 
      :pointerEvents="true"
    />
  </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { SlotData } from '../models/SlotData';
import Item from './Item.vue';
import type { CSSProperties } from 'vue';

@Component({
  components: {
    Item
  },
  emits: ['slot-click', "slot-mouse-enter", "slot-mouse-leave"]
})
export default class SlotComponent extends Vue {
  @Prop({type: SlotData, required: true}) slotData!: SlotData


  onClick(event: MouseEvent) {
    if (!this.slotData) return
    this.$emit('slot-click', this.slotData)
  }

  onMouseEnter(): void {
    this.$emit('slot-mouse-enter', this.slotData)
  }

  onMouseLeave(): void {
    this.$emit('slot-mouse-leave', this.slotData)
  }

  get style(): CSSProperties {
  return {
    borderWidth: "1rem",
    borderStyle: "solid",
    borderImage: this.slotData.item?.rarityToBackgroundImage()
      ? `url(${this.slotData.item.rarityToBackgroundImage()}) 50 50 50 50 repeat`
      : "none",
    borderImageWidth: "48 48 48 48",
    borderImageSlice: "48 48 48 48"
  };
}

  
}
</script>

<style scoped>

.slot-container {
  display:  flex;
  align-content: center;
  justify-content: center;
}

.slot-content {
  pointer-events:all;
}

.info {
  position: absolute;
}

.background-container {
  position: absolute;
  display: inline-block;
  width: 100%;
  height: 100%;
  top: -25%;
  left: 0;
  z-index: -2;
}

.background-container::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 255, 255); /* Change the color and opacity as needed */
  mix-blend-mode: overlay;
  z-index: 1;
}

.background-container img {
  display: block;
  width: 100%;
  height: 100%;
}

</style>