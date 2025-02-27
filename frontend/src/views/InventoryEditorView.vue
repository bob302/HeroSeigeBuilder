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
      <VersionComponent />
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
        <div class="serialization-buttons">
          <div class="section">
            <button @click="exportContext">Generate Link</button>
          <div>
            <p>Permanent Token:</p>
            <input v-model="permanentToken" type="text">
          </div>
          </div>
          <div class="section">
            <button @click="exportToFile">Export to File</button>
          <button @click="importFromFile">Import from File</button>
          </div>
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
import VersionComponent from "../components/Version.vue"

@Component({
  components: {
    TheInventory,
    SkillTreeComponent,
    CharapterList,
    AttributeList,
    CatalogModal,
    ItemTooltip,
    SubSkillTreeComponent,
    VersionComponent
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
  permanentToken: string = '';

  mounted() {
    equipmentService.initialize(() => {
      this.isSocketablesLoaded = true;
    });

    document.addEventListener("mousemove", this.updateMousePosition);

    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);

    const routeLink = this.$route.params.link as string | undefined;
    if (routeLink) {
      this.importContext();
    }

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
  const workerHost = import.meta.env.VITE_WORKER_HOST;
  const appHost = import.meta.env.VITE_APP_HOST;
  try {
    const serialized = this.editorContext.serialize();
    const response = await fetch(`${workerHost}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: serialized, token: this.permanentToken}),
    });
    
    if (!response.ok) {
      alert(`Export failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const result = await response.json();
    if (!result.key) {
      alert("Invalid response from server");
      return;
    }
    
    const shortLink = `${appHost}editor/${result.key}`;
    await navigator.clipboard.writeText(shortLink);
    alert(`Link copied to clipboard. ${result.isPermanent ? 'Build link will not be deleted.' : `Build link will be deleted in ${result.linkLefespan} seconds.`}`);
  } catch (error) {
    console.error("Export error:", error);
    alert("Error during export. Check console for details.");
  }
}

async importContext() {
  const workerHost = import.meta.env.VITE_WORKER_HOST;
  const urlKey = window.location.pathname.split("/").pop();
  if (!urlKey) return;

  try {
    const response = await fetch(`${workerHost}/${urlKey}`);
    
    if (!response.ok) {
      alert(`Import failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    const newContext = await EditorContext.deserialize(data);

    EditorContextProvider.setContext(newContext);
    this.editorContext = EditorContextProvider.getContext();
    alert(`Import complete!`);
  } catch (error) {
    console.error("Deserialization error:", error);
    alert("Error during import. Check console for details.");
  }
}

async exportToFile() {
  try {
    const serialized = this.editorContext.serialize();
    const json = JSON.stringify(serialized, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const selectedCharapter = this.editorContext.getSelectedCharapter();
    const baseName = selectedCharapter?.name || "context";

    const now = new Date();
    const datePart = now.toISOString().split("T")[0];
    const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const filename = `${baseName}_${datePart}_${timePart}.json`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Context exported to file successfully.");
  } catch (error) {
    console.error("Export to file error:", error);
    alert("Error during file export. Check console for details.");
  }
}



  async importFromFile() {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = async () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          const text = await file.text();
          try {
            const parsed = JSON.parse(text);
            const newContext = await EditorContext.deserialize(parsed);
            EditorContextProvider.setContext(newContext);
            this.editorContext = EditorContextProvider.getContext();
            alert("Context imported from file successfully.");
          } catch (error) {
            console.error("Import from file error:", error);
            alert("Error during file import. Check console for details.");
          }
        }
      };
      input.click();
    } catch (error) {
      console.error("Import from file setup error:", error);
      alert("Error during file import setup. Check console for details.");
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
  margin-left: 9.8%;
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
.secondary-buttons button,
.serialization-buttons button {
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
.side-nav button:hover, .serialization-buttons button:hover {
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

.serialization-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  margin: 1rem;
}

.serialization-buttons section {
  display: flex;
  flex-direction: row;
}

.serialization-buttons > * {
  padding: 1rem;
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
    margin: 0;
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

  .serialization {
    padding-bottom: 15vh;
  }

  .serialization-buttons button {
    width: 90%;
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
