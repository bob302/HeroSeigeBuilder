<template>
  <Transition name="fade">
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
      <div class="modal">
        <button class="close-button" @click="close">✕</button>
        <div class="modal-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from "vue-facing-decorator";

@Component({
  name: "TextModalComponent", 
  emits:['close']})
class TextModalComponent extends Vue {
  @Prop({ default: false }) readonly isVisible!: boolean;

  close() {
    this.$emit("close", false);
  }
}
export {TextModalComponent} 
export default toNative(TextModalComponent);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-modal-background);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--blur-amount);
  z-index: 1000;
}

.modal {
  background: var(--color-modal);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  max-width: 50%;
  width: 50%;
  text-align: center;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg, 1.25rem);
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-content {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: bold;
  padding: 5% 0 5%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal {
  max-width: 100%;
  width: 100%;
  }
}
</style>