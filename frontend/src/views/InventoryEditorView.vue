<template>
  <div class="container">
    <div class="logo">
    <img src="/img/editor/logo.webp" />
  </div>
  <TheInventory :context="gameContext"/>
  </div>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TheInventory from '../components/TheInventory.vue'
import { GameContextProvider } from '../models/GameContextProvider';

@Component({
  components: {
    TheInventory
}})
export default class InventoryEditorView extends Vue {
  gameContext = GameContextProvider.getContext();

}
</script>

<style scoped>
.container {
  background-image: url('/img/editor/background.png');
  background-size: cover;
}
.logo {
  padding-bottom: 2rem;
}
.item-background {
  min-width: 100%;
  min-height: 100%;
  position: relative;
  z-index: -1;
  bottom: 100%
}

.slot-item {
  z-index: 2;
}


.inventory-item {
  border: 1px solid #3d2b1f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  text-align: center;
  font-weight: bold;
}

.inventory-container > * {
  width: 100%;
  height: 100%;
}






</style>
