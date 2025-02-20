<template>
  <div class="display-container" @click="saveItem()" :class="{ saved: isSaved }">
    <div class="item-content">
      <div class="item">
        <ItemComponent :equipment="equipment" :showSockets="showSockets" :pointerEvents="true"
          @item-on-mouse-enter="onMouseEnter" @item-on-mouse-leave="onMouseLeave" />
      </div>
      <div class="frame">
        <ItemFrame :src="src" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Equipment } from '../models/Equipment'
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ItemComponent from './ItemComponent.vue'
import ItemFrame from './ItemFrame.vue'

@Component({
  components: {ItemComponent, ItemFrame},
  emits: ['item-display-on-mouse-enter', 'item-display-on-mouse-leave']
})
export default class ItemDisplay extends Vue {
  @Prop({ type: Object, required: true }) equipment!: Equipment;
  @Prop({ type: Boolean, required: true }) showSockets!: boolean;
  @Prop({ type: String, required: true }) src!: string;

  pointerEvents: boolean = false
  isSaved = false

  mounted() {

  }

  saveItem() {
  const json = JSON.stringify(this.equipment, null, 2)
  navigator.clipboard.writeText(json).then(() => {
  })
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
.display-container {
  width: 7.6rem;
  height: 11.32rem;
  max-width: 7.6rem;
  max-height: 11.32rem;
  pointer-events: none;
  overflow: hidden;
}

.item-content {
  height: 100%;
  display:  flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.frame {
  min-width: 100%;
  min-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
}

.item {
  z-index: 10;
}

.display-container:hover {
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
