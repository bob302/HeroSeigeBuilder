<template>
  <div class="container">
    <SideNavComponent @nav-click="handleNavClick" />

    <!-- Main Content -->
    <div class="column main-content" :class="{ 'with-sidebar': showModSidebar }">
      <div :ref="Section.Charapters">
        <CharapterList @charapter-selected="scrollToSection(Section.Skills)" />
      </div>

      <div class="loading" v-if="editorContext.getSelectedCharapter() === null"></div>
      <div class="skill-trees-wrapper" :ref="Section.Skills" v-else>
        <AttributeList />
        <h3>{{ `Points Left: ${editorContext.getSkillPoints()}` }}</h3>
        <SkillTreeComponent v-for="(skillTree, index) in editorContext.getSelectedCharapter()!.skillTrees" :key="index"
          :skillTree="skillTree" @toggle-subskills="onToggleSubskills" />
      </div>

      <div :ref="Section.Inventory">
        <TheInventory />
      </div>

      <EquipmentEditor />

      <div class="serialization">
        <div class="serialization-buttons">
          <div class="section">
            <button class="serialization-button" @click="exportContext">Generate Link</button>
            <div>
              <input v-model="permanentToken" type="text" placeholder="Token to save permanently">
            </div>
          </div>
          <div class="section">
            <button class="serialization-button" @click="exportToFile">Export to File</button>
            <button class="serialization-button" @click="importFromFile">Import from File</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mod Sidebar -->
    <div class="mod-sidebar" :class="{ 'hidden': !showModSidebar }">
      <div class="sidebar-toggle" @click="toggleModSidebar">
        <span v-if="showModSidebar">❯</span>
        <span v-else>❮</span>
      </div>
      <div class="sidebar-content">
        <PresetItemList v-if="showModSidebar" @open-catalog-with-set="openCatalogWithSet" />
      </div>
    </div>
  </div>

  <keep-alive>
    <CatalogModal v-if="editorContext.currentView === EditorViewState.Catalog" :show="true"
      @close="editorContext.resetView()" :setItems="currentSetItems" :setName="currentSetName" />
  </keep-alive>

  <SubSkillTreeComponent v-if="editorContext.currentView === EditorViewState.SubSkillTree"
    @close="editorContext.resetView()" :skillTree="editorContext.activeSubSkillTree" />

  <ItemTooltip v-if="editorContext.lookingAt && !editorContext.isItemOnCursor()" :item="editorContext.lookingAt"
    :pos="editorContext.tooltipPosition" @close="editorContext.lookingAt = null" />

  <TextModalComponent :isVisible="editorContext.currentView === EditorViewState.Restrictions" @close="resetViews">
    <p v-if="!editorContext.getSelectedCharapter()?.isBlackList()">
      {{ editorContext.getSelectedCharapter()!.name }} only can use:</p>
    <div class="restrictions-list"
      v-if="editorContext.getSelectedCharapter()?.restrictions.size! > 0 && !editorContext.getSelectedCharapter()?.isBlackList()">
      <p v-for="(weapon, index) in editorContext.getSelectedCharapter()?.restrictions" :key="index">
        {{ weapon }}
      </p>
    </div>
    <p v-else>{{ editorContext.getSelectedCharapter()!.name }} can use any weapon.</p>
  </TextModalComponent>

  <TextModalComponent :isVisible="editorContext.currentView === EditorViewState.Info" @close="resetViews">
    <h1>Hero Siege Builder</h1>
    <p>This build creation tool was designed to closely replicate the in-game experience, rather than being a spreadsheet full of tables and formulas.</p>
    <p>It's built to be as intuitive and hassle-free as possible.</p>
    <p>Additionally, this project serves as an opportunity to explore what frontenders actually  doing, particularly by testing Vue, since my main expertise is in backend development.</p>
    <p>All item attributes, as well as class names and skill trees, are obtained by parsing the Hero Siege wiki (<a href="https://herosiege.wiki.gg/" class="link">https://herosiege.wiki.gg/</a>) and from Game Assets and may not be complete or accurate.</p>
    <p>I don't plan on doing attribute calculations, at least not yet.</p>
    <p>Issue Tracker: (<a href="https://github.com/bob302/HeroSeigeBuilder/issues" class="link">https://github.com/bob302/HeroSeigeBuilder/issues</a>)</p>
    <p>Addblockers can block part of content.</p>
    <div class="notice">
      <p>Note: This application currently runs on Cloudflare Workers (free tier) and may occasionally reach the request limit.</p>
      <p>You can use the import/export functionality to save and load your builds locally.</p>
    </div>
    <VersionComponent />
</TextModalComponent>

  <ConfirmModalComponent :isVisible="editorContext.currentView === EditorViewState.Confirmation"
    :message="editorContext.confirmationMessage" @confirm="editorContext.resolveConfirmation(true)"
    @close="editorContext.resolveConfirmation(false)">
    <div class="confirmation-message">
      {{ editorContext.confirmationMessage }}
    </div>
  </ConfirmModalComponent>
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
import SideNavComponent, { SideNavAction } from "../components/SideNavComponent.vue";
import ConfirmModalComponent from "../components/ConfirmModalComponent.vue";
import TextModalComponent from "../components/TextModalComponent.vue";
import VersionComponent from "../components/VersionComponent.vue";
import { secureParse } from "../util/SourceValidator";
import EquipmentEditor from "../components/EquipmentEditor.vue";
import PresetItemList from "../components/PresetItemList.vue";
import type { BaseItem } from "../models/Equipment";
import type { SavedEquipmentSet } from "../service/LocalStorageService";

enum Section {
  Charapters = "charaptersSection",
  Skills = "skillsSection",
  Inventory = "inventorySection",
}

@Component({
  components: {
    TheInventory,
    SkillTreeComponent,
    CharapterList,
    AttributeList,
    CatalogModal,
    ItemTooltip,
    SubSkillTreeComponent,
    SideNavComponent,
    TextModalComponent,
    ConfirmModalComponent,
    VersionComponent,
    EquipmentEditor,
    PresetItemList
  },
})
class InventoryEditorView extends Vue {
  @Provide()
  editorContext: Reactive<EditorContext> = EditorContextProvider.getContext();

  serializationData: string = "";
  EditorViewState = EditorViewState;
  isSocketablesLoaded = false;
  permanentToken: string = '';
  Section = Section;
  
  currentSetItems: BaseItem[] = [];
  currentSetName: string = '';
  
  showModSidebar: boolean = true;

  mounted() {
    equipmentService.initialize(() => {
      this.isSocketablesLoaded = true;
      
      const routeLink = this.$route.params.link as string | undefined;
      if (routeLink) {
        this.importContext();
      }
    });

    document.addEventListener("mousemove", this.updateMousePosition);
    
    window.addEventListener("resize", this.onResize);
    this.onResize();
    
    // Load sidebar state from localStorage if available
    const savedSidebarState = localStorage.getItem('showModSidebar');
    if (savedSidebarState !== null) {
      this.showModSidebar = savedSidebarState === 'true';
    }
  }

  unmounted() {
    document.removeEventListener("mousemove", this.updateMousePosition);
    window.removeEventListener("resize", this.onResize);
  }

  // Toggle sidebar visibility
  toggleModSidebar() {
    this.showModSidebar = !this.showModSidebar;
    // Save state to localStorage
    localStorage.setItem('showModSidebar', this.showModSidebar.toString());
  }

  openCatalogWithSet(set: SavedEquipmentSet) {
    this.currentSetItems = set.items;
    this.currentSetName = set.name;
    this.editorContext.setView(EditorViewState.Catalog)
  }

  private onResize() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    let factor = 0.75;
    if (window.innerWidth > 768) {
      factor = Math.min(1, Math.max(0.5, aspectRatio / 2));
    }

    this.editorContext.setScaleFactor(factor)
  }

  async handleAction(action: SideNavAction) {
    switch (action) {
      case SideNavAction.ClearInventory: {
        if (await this.editorContext.showConfirm("Are you sure you want to clear the inventory?")) {
          this.editorContext.mainInventory.clear();
        }
        break;
      }
      case SideNavAction.ClearCharmInventory: {
        if (await this.editorContext.showConfirm("Are you sure you want to clear the charm inventory?")) {
          this.editorContext.charmInventory.clear();
        }
        break;
      }
      case SideNavAction.ClearEquipment: {
        if (await this.editorContext.showConfirm("Are you sure you want to clear the equipment?")) {
          this.editorContext.clearEquipment();
        }
        break;
      }
    }
  }

  async handleNavClick(action: SideNavAction) {
    switch (action) {
      case SideNavAction.Characters: {
        this.scrollToSection(Section.Charapters)
        break
      }
      case SideNavAction.Skills: {
        this.scrollToSection(Section.Skills)
        break
      }
      case SideNavAction.Inventory: {
        this.scrollToSection(Section.Inventory)
        break
      }
      case SideNavAction.Items: {
        this.editorContext.setView(EditorViewState.Catalog);
        break
      }
      case SideNavAction.Info: {
        this.editorContext.setView(EditorViewState.Info);
        break
      }
      case SideNavAction.Restrictions: {
        this.editorContext.setView(EditorViewState.Restrictions);
        break
      }
      case SideNavAction.ClearInventory: {
        await this.handleAction(SideNavAction.ClearInventory)
        break;
      }
      case SideNavAction.ClearCharmInventory: {
        await this.handleAction(SideNavAction.ClearCharmInventory)
        break;
      }
      case SideNavAction.ClearEquipment: {
        await this.handleAction(SideNavAction.ClearEquipment)
        break;
      }
      case SideNavAction.UnlockCharmTopSlot: {
        this.editorContext.unlockCharmTopSlot()
        break
      }
      case SideNavAction.UnlockCharmBottomSlot: {
        this.editorContext.unlockCharmBottomSLot()
        break
      }
    }
  }

  resetViews() {
    this.editorContext.resetView();
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

  scrollToSection(section: Section) {
    this.$nextTick(() => {
      const element = this.$refs[`${section}`] as HTMLElement;
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  async exportContext() {
  const workerHost = import.meta.env.VITE_WORKER_HOST;
  const appHost = import.meta.env.VITE_APP_HOST;
  try {
    const serialized = this.editorContext.serialize();
    
    // Minify JSON by removing all whitespace
    const minifiedJSON = JSON.stringify(serialized);
    
    // Convert JSON to Uint8Array for compression
    const jsonBytes = new TextEncoder().encode(minifiedJSON);
    
    // Compress with gzip using CompressionStream API
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(jsonBytes);
    writer.close();
    
    // Get compressed data
    const compressedData = await new Response(cs.readable).arrayBuffer();
    
    // Convert to base64 for transport
    const base64Compressed = btoa(
      String.fromCharCode(...new Uint8Array(compressedData))
    );
    
    const response = await fetch(`${workerHost}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        data: base64Compressed, 
        compressed: true,
        token: this.permanentToken 
      }),
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
    
    const shortLink = `${appHost}/editor/${result.key}`;
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

      const responseText = await response.text();
      
      try {
        const secureData = secureParse(responseText);
        const newContext = await EditorContext.deserialize(secureData);

        EditorContextProvider.setContext(newContext);
        this.editorContext = EditorContextProvider.getContext();
      } catch (parseError) {
        console.error("Secure parsing error:", parseError);
        alert("Error during secure data parsing. The data may be corrupted or malicious.");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Error during import. Check console for details.");
    }
  }

  async exportToFile() {
  try {
    const serialized = this.editorContext.serialize();
    
    // Use minified JSON without pretty-printing (remove null, 2)
    const json = JSON.stringify(serialized);
    
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
            const secureData = secureParse(text);
            const newContext = await EditorContext.deserialize(secureData);
            
            EditorContextProvider.setContext(newContext);
            this.editorContext = EditorContextProvider.getContext();
            alert("Context imported from file successfully.");
          } catch (error) {
            console.error("Secure import from file error:", error);
            alert("Error during file import. The file may be corrupted or contain malicious data.");
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
/* Main Layout */
.container {
  display: flex;
  min-height: 100vh;
  background: url("/img/editor/background.png");
  background-size: contain;
  width: 100%;
  position: relative;
}

/* Main Content Section */
.main-content {
  margin-left: 10%;
  flex: 1;
  transition: width 0.3s ease;
}

.main-content.with-sidebar {
  margin-right: 10%; /* Space for the sidebar */
}

/* Mod Sidebar */
.mod-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 10%;
  background-color: var(--color-background, #f8f9fa);
  border-left: 1px solid var(--color-border, #ccc);
  transition: transform 0.3s ease;
  z-index: 100;
  display: flex;
}

.mod-sidebar.hidden {
  transform: translateX(100%);
}

.sidebar-toggle {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-primary, #4a5568);
  color: white;
  width: 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 10px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem;
}

/* Skill Trees */
.skill-trees-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background: var(--color-background);
  padding-bottom: 2rem;
}

/* Serialization */
.serialization-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  margin: 1rem;
}

.serialization-buttons .section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin: 0.75rem 0 0.75rem;
  width: 25%;
}

.serialization-button {
  width: 100%;
  height: 2rem;
}

/* Modals */
.restrictions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .main-content {
    padding: 0;
    margin: 0;
  }

  .main-content.with-sidebar {
    margin-right: 0;
  }

  .mod-sidebar {
    width: 100%;
    height: 80vh;
    top: 0;
    bottom: auto;
    border-left: none;
  }

  .mod-sidebar.hidden {
    transform: translateY(-100%)  rotate(180deg);
  }

  .sidebar-toggle {
    left: 50%;
    top: -20px;
    transform: translateX(-50%) rotate(90deg);
    border-radius: 4px 4px 0 0;
  }

  .skill-trees-wrapper {
    flex-direction: column;
    justify-content: center;
  }

  .serialization {
    padding-bottom: 15vh;
  }

  .serialization-buttons {
    margin: 0;
  }

  .serialization-buttons .section {
    flex-direction: column;
  }
}
</style>