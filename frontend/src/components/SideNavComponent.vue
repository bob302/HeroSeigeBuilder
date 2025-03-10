<template>
    <div v-if="isMobile" class="mobile-menu-toggle">
    <button @click="toggleMenu">
      <i class="fas fa-bars mobile-icon"></i>
    </button>
  </div>

  <nav class="side-nav" v-show="isMenuVisible">
    <div class="primary-buttons" v-if="isPrimaryVisible">
      <button @click="emitNavClick(SideNavAction.Characters)">
        <span class="desktop-text">Characters</span>
        <i class="fas fa-user mobile-icon"></i>
      </button>
      <button @click="emitNavClick(SideNavAction.Skills)">
        <span class="desktop-text">Skills</span>
        <i class="fa-solid fa-square-plus mobile-icon"></i>
      </button>
      <button @click="emitNavClick(SideNavAction.Inventory)">
        <span class="desktop-text">Inventory</span>
        <i class="fas fa-box mobile-icon"></i>
      </button>
      <button @click="emitNavClick(SideNavAction.Items)">
        <span class="desktop-text">Items</span>
        <i class="fas fa-book mobile-icon"></i>
      </button>
      <button @click="emitNavClick(SideNavAction.Info)">
        <span class="desktop-text">Info</span>
        <i class="fas fa-info-circle mobile-icon"></i>
      </button>
      <button @click="toggleSecondary">
        <span class="desktop-text">{{ isSecondaryVisible ? "Less" : "More" }}</span>
        <i class="fas fa-ellipsis-h mobile-icon"></i>
      </button>
    </div>
    <Transition name="slide-fade">
      <div class="secondary-buttons" v-if="isSecondaryVisible">
        <button @click="emitNavClick(SideNavAction.Restrictions)">
          <span class="desktop-text">Class Restrictions</span>
          <i class="fa-solid fa-xmark mobile-icon"></i>
        </button>
        <button @click="emitNavClick(SideNavAction.ClearInventory)">
          <span class="desktop-text">Clear Inventory</span>
          <i class="fa-solid fa-trash mobile-icon"></i>
        </button>
        <button @click="emitNavClick(SideNavAction.ClearCharmInventory)">
          <span class="desktop-text">Clear Charm Inventory</span>
          <i class="fa-solid fa-trash mobile-icon"></i>
        </button>
        <button @click="emitNavClick(SideNavAction.ClearEquipment)">
          <span class="desktop-text">Clear Equipment</span>
          <i class="fa-solid fa-trash mobile-icon"></i>
        </button>
        <button @click="emitNavClick(SideNavAction.UnlockCharmTopSlot)">
        <span v-if="!editorContext.isTopSlotUnlocked()" class="desktop-text">Unlock Top Slot</span>
        <span v-else class="desktop-text">Lock Top Slot</span>
        <i v-if="!editorContext.isTopSlotUnlocked()" class="fa-solid fa-lock-open mobile-icon"></i>
        <i v-else class="fa-solid fa-lock mobile-icon"></i>
      </button>
      <button @click="emitNavClick(SideNavAction.UnlockCharmBottomSlot)">
        <span v-if="!editorContext.isBottomSlotUnlocked()" class="desktop-text">Unlock Bottom Slot</span>
        <span v-else class="desktop-text">Lock Bottom Slot</span>
        <i v-if="!editorContext.isBottomSlotUnlocked()" class="fa-solid fa-lock-open mobile-icon"></i>
        <i v-else class="fa-solid fa-lock mobile-icon"></i>
      </button>
      </div>
    </Transition>

        <!-- Alpha Badge -->
    <div class="alpha-badge">
      <span>Alpha</span>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Inject, toNative, Vue } from "vue-facing-decorator";
import type EditorContext from "../models/EditorContext";

enum SideNavAction {
  Characters = "characters",
  Skills = "skills",
  Inventory = "inventory",
  Items = "items",
  Info = "info",
  Restrictions = "restrictions",
  ClearInventory = "clear-inventory",
  ClearCharmInventory = "clear-charm-inventory",
  ClearEquipment = "clear-equipment",
  UnlockCharmTopSlot = "unlock-top-slot",
  UnlockCharmBottomSlot = "unlock-bottom-slot"
}

@Component({
  emits: ["nav-click"],
})
class SideNavComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  isMenuVisible: boolean = true;
  isPrimaryVisible: boolean = true;
  isSecondaryVisible: boolean = false;
  isMobile: boolean = false;

  SideNavAction = SideNavAction

  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  }

  unmounted() {
    window.removeEventListener("resize", this.checkMobile);
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;

    if (!this.isMobile) {
      this.isMenuVisible = true;
      this.isPrimaryVisible = true;
      this.isSecondaryVisible = true;
    }
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;

    if (!this.isMenuVisible) {
      this.isPrimaryVisible = true;
      this.isSecondaryVisible = false;
    }
  }

  toggleSecondary() {
    this.isSecondaryVisible = !this.isSecondaryVisible;
  }

  emitNavClick(action: SideNavAction) {
    this.$emit("nav-click", action);
  }
}

export default toNative(SideNavComponent);
export { SideNavAction };
</script>

<style scoped>
/* Transition classes */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(10rem);
  opacity: 0;
}

/* Mobile Menu*/
.mobile-menu-toggle {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 3rem;
  height: 3rem;
}
.mobile-menu-toggle button {
  padding: 25%;
  font-size: 1.5rem;
  border-radius: 5%;
}

/* Side Menu */
.side-nav {
  position: fixed;
  top: 50%;
  min-width: 10%;
  max-width: 10%;
  transform: translateY(-50%);
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.5s ease;
  background: var(--color-background);
  z-index: 10;
}

/* Buttons */
.primary-buttons,
.secondary-buttons {
  display: flex;
  flex-direction: column;
  max-height: 33%;
  width: 100%;
}
.primary-buttons button,
.secondary-buttons button
{
  padding: 0.8rem 1rem;
  max-height: 15%;
  margin: 0 0.5rem 0.2rem 0.5rem;
}

.alpha-badge {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  text-align: center;
  margin: 0 auto;
  width: 70%;
  background-color: var(--color-background);
  color: var(--color-unholy);
  border: 1px solid var(--color-unholy);
  padding: 0.3rem 0.5rem;
  font-weight: bold;
}


/* Responsive */
@media (max-width: 768px) {
  .side-nav {
    position: fixed;
    flex-direction: row;
    top: 90%;
    left: 0;
    min-width: 0%;
    max-width: 100%;
    transform: none;
    align-items: start;
    z-index: 1000;
    width: 100%;
    justify-content: center;
  }
  .primary-buttons,
  .secondary-buttons {
    flex-direction: row;
    justify-content: center;
    position: absolute;
  }

  .secondary-buttons {
    top: -10%;
  }

  .primary-buttons button,
  .secondary-buttons button {
    padding: 0;
    font-size: 1.2rem;
    margin: 0 2px;
    width: 2.5rem;
    height: 2.5rem;
  }

  .primary-buttons button {
    width: 3.5rem;
    height: 3.5rem;
  }


  .primary-buttons button:hover,
  .secondary-buttons button:hover {
    background: var(--color-button-hover);
    transform: none;
  }

  .desktop-text {
    display: none;
  }
  .mobile-icon {
    display: inline;
  }
}

@media (min-width: 769px) {
  .desktop-text {
    display: inline;
  }
  .mobile-icon {
    display: none;
  }
  .secondary-buttons {
    margin-top: 1rem;
  }
  .mobile-menu-toggle {
    display: none;
  }
}
</style>
