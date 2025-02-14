<template>
    <div v-if="catalogItems.length === 0" class="loading">LOADING</div>
    <div v-else class="catalog">
      <ItemDisplay v-for="(item, index) in catalogItems"
      :show-sockets="true" 
      :key="index" 
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

  itemOnMouseEnter(item: Equipment) {
    this.$emit('item-on-mouse-enter', item)
  }

  itemOnMouseLeave() {
    this.$emit('item-on-mouse-leave')
  }

  private handleItemClick(item: Equipment) {
    this.$emit('item-click', item);
  }

  mounted() {
    
  }
}
</script>

<style>
.catalog {
  display: grid;
  grid-template-columns: 1fr repeat(5, 1fr) 1fr;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.catalog > * {
  scale: 0.65;
  margin: -1.8rem -0.9rem -1.8rem -0.9rem;
}
</style>