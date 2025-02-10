<template>
  <div class="display" @click="saveItem()" :class="{ saved: this.isSaved }">
    <div class="item">
      <Item :equipment="this.equipment" :showSockets="this.showSockets" :pointerEvents="true" 
      @item-on-mouse-enter="onMouseEnter" 
      @item-on-mouse-leave="onMouseLeave"/>
    </div>
    <div class="frame">
      <ItemFrame/>
    </div>
  </div>
</template>

<script lang="ts">
import type { Equipment } from '../models/Equipment'
import { Component, Prop, Vue } from 'vue-facing-decorator';
import Item from './Item.vue'
import ItemFrame from './ItemFrame.vue'

@Component({
  components: {Item, ItemFrame},
  emits: ['item-display-on-mouse-enter', 'item-display-on-mouse-leave']
})
export default class ItemDisplay extends Vue {
  @Prop({ type: Object, required: true }) equipment!: Equipment;

  showSockets: boolean = false
  pointerEvents: boolean = false
  isSaved = false

  saveItem = () => {
  const json = JSON.stringify(this.equipment, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    this.isSaved = true
    setTimeout(() => {
      this.isSaved = false
    }, 500)})
  }

  onMouseEnter(data: {equipment: Equipment, pos: {x: number, y: number}}) {
    this.$emit("item-display-on-mouse-enter", data)
  }

  onMouseLeave() {
    this.$emit("item-display-on-mouse-leave")
  }
}

</script>

<style scoped>
.display {
  position: relative;
  width: 7.6rem;
  height: 11.32rem;
  max-width: 7.6rem;
  max-height: 11.32rem;
  pointer-events: none;
  overflow: hidden;
}

.frame {
  min-width: 100%;
  min-height: 100%;
  position: absolute;
  z-index: 1;
}


.item {
  width: 7.6rem;
  height: 11.32rem;
  max-width: 7.6rem;
  max-height: 11.32rem;
  position: absolute;
  z-index: 2;
}

.display:hover {
  overflow: visible;
}

.container.saved {
  animation: savedEffect 2s ease-out;
}

@keyframes savedEffect {
  0% { filter: hue-rotate(90deg); }
  50% { filter: hue-rotate(180deg); }
  100% { filter: hue-rotate(270deg); }
}
</style>
