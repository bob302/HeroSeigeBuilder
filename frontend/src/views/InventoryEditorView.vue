<template>
  <div v-if="isMobile" class="mobile-menu-toggle">
    <button @click="toggleMenu">
      <i class="fas fa-bars mobile-icon"></i>
    </button>
  </div>

  <nav class="side-nav" v-show="isMenuVisible">
      <div class="primary-buttons" v-if="isPrimaryVisible">
        <button @click="navClick('characters')">
          <span class="desktop-text">Characters</span>
          <i class="fas fa-user mobile-icon"></i>
        </button>
        <button @click="navClick('skills')">
          <span class="desktop-text">Skills</span>
          <i class="fa-solid fa-square-plus mobile-icon"></i>
        </button>
        <button @click="navClick('inventory')">
          <span class="desktop-text">Inventory</span>
          <i class="fas fa-box mobile-icon"></i>
        </button>
        <button @click="showCatalog">
          <span class="desktop-text">Items</span>
          <i class="fas fa-book mobile-icon"></i>
        </button>
        <button @click="showInfo">
          <span class="desktop-text">Info</span>
          <i class="fas fa-info-circle mobile-icon"></i>
        </button>
        <button @click="toggleSecondary">
          <span class="desktop-text">{{ isSecondaryVisible ? 'Less' : 'More' }}</span>
          <i class="fas fa-ellipsis-h mobile-icon"></i>
        </button>
      </div>
      <Transition name="slide-fade">
      <div class="secondary-buttons" v-if="isSecondaryVisible">
      <button @click="showRestrictions" style="background-color: rgba(255, 55, 0, 0.5);">
        <span class="desktop-text">Class Restrictions</span>
        <i class="fa-solid fa-xmark mobile-icon"></i>
      </button>
      <button @click="clearInventory" style="background-color: rgba(125, 55, 0, 0.5);">
        <span class="desktop-text">Clear Inventory</span>
        <i class="fa-solid fa-trash mobile-icon"></i>
      </button>
      <button @click="clearCharnInventory" style="background-color: rgba(55, 125, 0, 0.5);">
        <span class="desktop-text">Clear Charm Inventory</span>
        <i class="fa-solid fa-trash mobile-icon"></i>
      </button>
      <button @click="clearEquipment" style="background-color: rgba(0, 55, 125, 0.5);">
        <span class="desktop-text">Clear Equipment</span>
        <i class="fa-solid fa-trash mobile-icon"></i>
      </button>
      <button @click="unlockCharmTopSlot">
        <span class="desktop-text">Unlock Top Slot</span>
        <i v-if="editorContext.isTopSlotUnlocked()" class="fa-solid fa-lock-open mobile-icon"></i>
        <i v-if="!editorContext.isTopSlotUnlocked()" class="fa-solid fa-lock mobile-icon"></i>
      </button>
      <button @click="unlockCharmBottomSLot">
        <span class="desktop-text">Unlock Bottom Slot</span>
        <i v-if="editorContext.isBottmoSlotUnlocked()" class="fa-solid fa-lock-open mobile-icon"></i>
        <i v-if="!editorContext.isBottmoSlotUnlocked()" class="fa-solid fa-lock mobile-icon"></i>
      </button>
      
      </div>
      </Transition>
    
  </nav>
  <div class="container">
    <div class="column main-content">
      <div ref="charactersSection">
        <CharapterList @charapter-selected="scrollToSection('skills')" />
      </div>

      <div class="loading" v-if="editorContext.getSelectedCharapter() === null"></div>
      <div class="skill-trees-wrapper" ref="skillsSection" v-else>
        <AttributeList />
        <p>{{ `Points Left: ${editorContext.getSkillPoints()}` }}</p>
        <SkillTreeComponent v-for="(skillTree, index) in editorContext.getSelectedCharapter()!.skillTrees" :key="index"
          :skillTree="skillTree" @toggle-subskills="onToggleSubskills" />
      </div>

      <div ref="inventorySection">
        <TheInventory />
      </div>

      <div class="serialization">
        <h2>Serialization test</h2>
        <div class="serialization-buttons">
          <button @click="exportContext">Export</button>
          <button @click="importContext">Import</button>
        </div>
      </div>
    </div>
  </div>

  <keep-alive>
    <CatalogModal v-if="editorContext.currentView === editorViewStates.Catalog" :show="true"
      @close="editorContext.resetView()" />
  </keep-alive>

  <SubSkillTreeComponent v-if="editorContext.currentView === editorViewStates.SubSkillTree"
    @close="editorContext.resetView()" :skillTree="editorContext.activeSubSkillTree" />

  <ItemTooltip v-if="editorContext.lookingAt && !editorContext.isItemOnCursor()" :item="editorContext.lookingAt"
    :pos="editorContext.tooltipPosition" />

  <div v-if="editorContext.currentView === editorViewStates.Restrictions" class="restrictions-modal">
    <div class="restrictions-content" @click.self="closeViews">
      <p>This class can use:</p>
      <div class="restrictions-list" v-if="editorContext.getSelectedCharapter()?.restrictions.size! > 0">
        <p v-for="(weapon, index) in editorContext.getSelectedCharapter()?.restrictions" :key="index">
          {{ weapon }}
        </p>
      </div>
      <p v-else>This class can use any weapon.</p>
    </div>
  </div>

  <div v-if="editorContext.currentView === editorViewStates.Info" class="info-modal">
    <div class="info-content" @click.self="closeViews">
      <p>{{ infoText }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, toNative, Vue } from "vue-facing-decorator";
import TheInventory from "../components/TheInventory.vue";
import SkillTreeComponent from "../components/SkillTree.vue";
import CharapterList from "../components/CharapterList.vue";
import AttributeList from "../components/AttributeList.vue";
import EditorContext, { EditorViewState } from "../models/EditorContext";
import { type Reactive } from "vue";
import EditorContextProvider from "../models/EditorContextProvider";
import { equipmentService } from "../service/EquipmentService";
import CatalogModal from "../components/CatalogModal.vue";
import ItemTooltip from "../components/ItemTooltip.vue";
import SubSkillTreeComponent from "../components/SubsSkillTree.vue";
import type CharapterSkill from "../models/CharapterSkill";

@Component({
  components: {
    TheInventory,
    SkillTreeComponent,
    CharapterList,
    AttributeList,
    CatalogModal,
    ItemTooltip,
    SubSkillTreeComponent,
  },
})
class InventoryEditorView extends Vue {
  @Provide()
  editorContext: Reactive<EditorContext> = EditorContextProvider.getContext();

  serializationData: string = "";

  editorViewStates = EditorViewState;

  infoText = `All item attributes, as well as character names and their skill trees, are obtained by parsing the Herosiege wiki (https://herosiege.wiki.gg/) and may be incomplete or inaccurate.`;

  isSocketablesLoaded = false;

  isMenuVisible: boolean = true;
  isPrimaryVisible: boolean = true;
  isSecondaryVisible: boolean = false;
  isMobile: boolean = false;

  mounted() {
    equipmentService.initialize(() => {
      this.isSocketablesLoaded = true;
    });

    document.addEventListener("mousemove", this.updateMousePosition);

    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  }

  unmounted() {
    document.removeEventListener("mousemove", this.updateMousePosition);
    window.removeEventListener('resize', this.checkMobile);
  }

  closeViews() {
    this.editorContext.resetView();
  }

  showCatalog() {
    this.editorContext.setView(EditorViewState.Catalog);
  }

  showInfo() {
    this.editorContext.setView(EditorViewState.Info);
  }

  showRestrictions() {
    this.editorContext.setView(EditorViewState.Restrictions);
  }

  onToggleSubskills(skill: CharapterSkill) {
    if (skill.subSkillTree) {
      this.editorContext.setView(
        EditorViewState.SubSkillTree,
        skill.subSkillTree,
      );
    }
  }

  updateMousePosition(event: MouseEvent) {
    this.editorContext.mousePosition = { x: event.clientX, y: event.clientY };
  }

  navClick(section: "characters" | "skills" | "inventory") {
    this.scrollToSection(section);
  }

  scrollToSection(section: "characters" | "skills" | "inventory") {
    this.$nextTick(() => {
      const element = this.$refs[`${section}Section`] as HTMLElement;
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    
    // Автоматически показывать оба меню на десктопе
    if (!this.isMobile) {
      this.isMenuVisible = true;
      this.isPrimaryVisible = true;
      this.isSecondaryVisible = true;
    }
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    // Сбрасываем состояния при закрытии меню
    if (!this.isMenuVisible) {
      this.isPrimaryVisible = true;
      this.isSecondaryVisible = false;
    }
  }

  toggleSecondary() {
    this.isSecondaryVisible = !this.isSecondaryVisible;
}

  clearInventory() {
    this.editorContext.mainInventory.clear();
  }

  clearCharnInventory() {
    this.editorContext.charmInventory.clear();
  }

  clearEquipment() {
    this.editorContext.clearEquipment();
  }

  unlockCharmTopSlot() {
    this.editorContext.unlockCharmTopSlot()
  }

  unlockCharmBottomSLot() {
    this.editorContext.unlockCharmBottomSLot()
  }

  async exportContext() {
    const serialized = this.editorContext.serialize();
    const json = JSON.stringify(serialized);

    navigator.clipboard.writeText(json);
    // alert("Placeholder")
  }

  async importContext() {
    try {
      let userPrompt = prompt("Please enter data", "");
      let data;
      if (userPrompt == null || userPrompt == "") {
        data = "User cancelled the prompt.";
      } else {
        data = userPrompt;
      }
      const parsed = JSON.parse(data);
      const newContext = EditorContext.deserialize(parsed);
      newContext.then((context) => {
        EditorContextProvider.setContext(context);
        this.editorContext = EditorContextProvider.getContext();
        // alert('Deserialization successful!');
        console.log("Deserialization successful!", this.editorContext);
      });
    } catch (error) {
      console.error("Deserialization error:", error);
      alert("Error during deserialization. Check console for details.");
    }
  }
}

export default toNative(InventoryEditorView)
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

/* Main */
.main-content {
  margin-left: 10%;
}
.container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  background: url("/img/editor/background.png") no-repeat center center/cover;
  width: 100%;
}

/* Side Menu */
.side-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.5s ease;
  background: var(--color-background);
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
.secondary-buttons button {
  padding: 0.8rem 1rem;
  margin: 0.1rem;
  background: var(--color-button);
  border: var(--color-border);
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 1px;
  font-weight: bold;
  transition: all 0.3s ease;
  max-height: 15%;
  width: 10rem;
}
.side-nav button:hover {
  background: var(--color-button-hover);
  transform: translateX(5px);
}

/* Mobile Menu*/
.mobile-menu-toggle {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 3.5rem;
  height: 3.5rem;
  background: var(--color-button);
}
.mobile-menu-toggle button {
  padding: 0.8rem 1rem;
  margin: 0.1rem;
  background: var(--color-button);
  border: var(--color-border);
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 1px;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1.5rem;
}

/* Test */
.skill-trees-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background: var(--color-background);
  padding-bottom: 2rem;
}
.serialization-test,
.serialization {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid #ccc;
  border-radius: 8px;
}
.serialization-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* Modal*/
.info-modal,
.restrictions-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-modal);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.info-content,
.restrictions-content {
  position: relative;
  background: #2d2a28;
  padding: 2rem;
  border-radius: 8px;
  max-width: 30rem;
  border: 2px solid #7a6857;
  color: #f0e6d2;
}
.restrictions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive */
@media (max-width: 768px) {
  .container,
  .main-content {
    padding: 0;
  }
  .side-nav {
    position: fixed;
    flex-direction: row;
    top: 90%;
    left: 0;
    transform: none;
    align-items: start;
    z-index: 1000;
    width: 100%;
    justify-content: center;
  }
  .primary-buttons {
    flex-direction: row;
    justify-content: center;
    position: absolute;
  }
  .secondary-buttons {
    flex-direction: row;
    justify-content: center;
    position: absolute;
    top: -10%;
  }

  .primary-buttons button {
    padding: 0;
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.2rem;
    margin: 0 2px;
  }
  .secondary-buttons button {
    padding: 0;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
    margin: 0 2px;
  }
  .primary-buttons button:hover,
  .secondary-buttons button:hover {
    background: var(--color-button-hover);
    transform: none;
  }
  .skill-trees-wrapper {
    flex-direction: column;
    justify-content: center;
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
    margin-top: 20px;
  }
  .mobile-menu-toggle {
    display: none;
  }
}
</style>
