<template>
  <nav class="side-nav" :class="{ 'mobile-active': isMenuOpen }">
    <button @click="navClick('characters')">
      <span class="desktop-text">Characters</span>
      <i class="fas fa-user mobile-icon"></i>
    </button>
    <button @click="navClick('skills')">
      <span class="desktop-text">Skills</span>
      <i class="fas fa-brain mobile-icon"></i>
    </button>
    <button @click="navClick('inventory')">
      <span class="desktop-text">Inventory</span>
      <i class="fas fa-box mobile-icon"></i>
    </button>
    <button @click="showCatalog">
      <span class="desktop-text">Catalog</span>
      <i class="fas fa-book mobile-icon"></i>
    </button>
    <button @click="showInfo">
      <span class="desktop-text">Info</span>
      <i class="fas fa-info-circle mobile-icon"></i>
    </button>
  </nav>
  <div class="container">
    <div class="column main-content">
      <div ref="charactersSection">
        <CharapterList @charapter-selected="scrollToSection('skills')" />
      </div>

      <div class="loading" v-if="!editorContext.selectedCharapter"></div>
      <div class="skill-trees-wrapper" ref="skillsSection" v-else>
        <AttributeList />
        <p>{{ `Points Left: ${editorContext.getSkillPoints()}` }}</p>
        <SkillTreeComponent
          v-for="(skillTree, index) in editorContext.selectedCharapter
            .skillTrees"
          :key="index"
          :skillTree="skillTree"
          @toggle-subskills="onToggleSubskills"
        />
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
    <CatalogModal
      v-if="editorContext.currentView === editorViewStates.Catalog"
      :show="true"
      @close="editorContext.resetView()"
    />
  </keep-alive>

  <SubSkillTreeComponent
    v-if="editorContext.currentView === editorViewStates.SubSkillTree"
    @close="editorContext.resetView()"
    :skillTree="editorContext.activeSubSkillTree"
  />

  <ItemTooltip
    v-if="editorContext.lookingAt && editorContext.itemOnCursor === null"
    :item="editorContext.lookingAt"
    :pos="editorContext.tooltipPosition"
  />

  <div
    v-if="editorContext.currentView === editorViewStates.Info"
    class="info-modal"
  >
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

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  mounted() {
    equipmentService.initialize(() => {
      this.isSocketablesLoaded = true;
    });

    document.addEventListener("mousemove", this.updateMousePosition);
  }

  unmounted() {
    document.removeEventListener("mousemove", this.updateMousePosition);
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
    this.isMenuOpen = false;
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
.main-content {
  margin-left: 10%;
}

.skill-trees-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: var(--color-background);
  padding-bottom: 2rem;
}

.side-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.side-nav button {
  padding: 0.8rem 1rem;
  background: #58483a7e;
  border: 2px solid #7a6857;
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 1px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.side-nav button:hover {
  background: #7a6857;
  transform: translateX(5px);
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  background-image: url("/img/editor/background.png");
  background-size: cover;
  width: 100%;
}

.side-nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  z-index: 10;
  background: rgba(17, 17, 16, 0.616);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  top: 50%;
  width: 10%;
  transform: translateY(-50%);
}

.serialization-test {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ccc;
  border-radius: 8px;
}

.serialization {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ccc;
  border-radius: 8px;
}

.serialization-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.info-content {
  position: relative;
  background: #2d2a28;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  border: 2px solid #7a6857;
  color: #f0e6d2;
}

.language-switcher {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.language-switcher button {
  padding: 0.3rem 0.8rem;
  background: #58483a;
  border: 1px solid #7a6857;
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 3px;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #f0e6d2;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.close-button:hover {
  color: #ff4444;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .main-content {
    padding: 0;
  }

  .side-nav {
    position: fixed;
    flex-direction: row;
    top: 90%;
    left: 0;
    height: 100vh;
    background: rgba(40, 35, 30, 0.95);
    transform: none;
    align-items: start;
    z-index: 1000;
    width: 100%;
  }

  .side-nav button {
    width: 4rem;
    font-size: 1.2rem;
    margin: 5px 0;
  }

  .side-nav button:hover {
    background: #7a6857;
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
}
</style>
