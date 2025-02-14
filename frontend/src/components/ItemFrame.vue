<template>
    <img :src="this.src" alt="Item frame" class="background" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component
export default class ItemDisplay extends Vue {
  @Prop({ type: String, required: true }) src!: string;

}
</script>

<style scoped>
.background {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
