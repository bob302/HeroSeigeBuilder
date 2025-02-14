<template>
  <div class="slot-container" :style="style" @click="onClick">
    <div v-if="!slotData.onCursor" class="slot-content">
    <ItemComponent 
      v-if="slotData.item?.data" 
      :equipment="slotData.item?.data" 
      :show-sockets="true" 
      :pointerEvents="true"
      @item-on-mouse-enter="onMouseEnter" 
      @item-on-mouse-leave="onMouseLeave"
    />
  </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { SlotData } from '../models/SlotData';
import type { CSSProperties } from 'vue';

import ItemComponent from './ItemComponent.vue';

@Component({
  components: {
    ItemComponent
  },
  emits: ['slot-click', "slot-mouse-enter", "slot-mouse-leave"]
})
export default class SlotComponent extends Vue {
  @Prop({type: SlotData, required: true}) slotData!: SlotData

  onClick(event: MouseEvent) {
    if (!this.slotData) return
    this.$emit('slot-click', this.slotData)
  }

  onMouseEnter(data: {slot: SlotData, pos: {x: number, y: number}}): void {
    this.$emit('slot-mouse-enter', {slot: this.slotData, pos: {x: data.pos.x, y: data.pos.y}})
  }

  onMouseLeave(): void {
    this.$emit('slot-mouse-leave')
  }

  get style(): CSSProperties {
    if (this.slotData.item === null) {
      return {
        border: 'none'
      }
    } else {
      return {
        boxSizing: "border-box",
        borderWidth: "0.3rem",
        borderStyle: "solid",
        borderImage: this.slotData.item?.rarityToBackgroundImage()
          ? `url(${this.slotData.item.rarityToBackgroundImage()}) 50 50 50 50 repeat`
          : "none",
        borderImageWidth: "96px",
        borderImageSlice: "64"
      };
    }
  }

  
}
</script>

<style scoped>

.slot-container {
  display:  flex;
  align-items: center;
  justify-content: center;
}

.slot-content {
  pointer-events:all;
}
</style>