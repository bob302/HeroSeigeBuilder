<template>
    <div class="catalog">
      <ItemDisplay v-for="(item) in catalogItems"
      :showSockets="showSockets" 
      :key="item.uuid" 
      :equipment="item" 
      :src="itemBackgroundSrc"
      @item-display-on-mouse-enter="itemOnMouseEnter"  
      @item-display-on-mouse-leave="itemOnMouseLeave"
      @click="handleItemClick(item)" 
      />
   </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ItemDisplay from './ItemDisplay.vue';
import { Equipment } from '../models/Equipment';



@Component({
  components: { ItemDisplay },
  emits: ['item-click', 'item-on-mouse-enter', 'item-on-mouse-leave']
})
export default class EquipmentCatalog extends Vue {
  @Prop({ type: Array, required: true }) catalogItems!: Equipment[];
  @Prop({ type: String, required: false }) itemBackgroundSrc: string = "/img/editor/item-background.png";
  @Prop({ type: Boolean, required: false }) showSockets: boolean = false;

  itemOnMouseEnter(item: Equipment) {
    this.$emit('item-on-mouse-enter', item)
  }

  itemOnMouseLeave() {
    this.$emit('item-on-mouse-leave')
  }

  private handleItemClick(item: Equipment) {
    this.$emit('item-click', item);
  }
}
</script>

<style>
.catalog {
  display: grid;
  align-content: flex-start;
  grid-template-columns: 1fr repeat(10, 1fr) 1fr;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 38rem;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 0.2rem;
}

.catalog > * {
  scale: 0.65;
  margin: -1.8rem -0.9rem -1.8rem -0.9rem;
}
</style>