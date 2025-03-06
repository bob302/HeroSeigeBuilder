<template>
  <div class="container">
    <SideNavComponent @nav-click="handleNavClick" />

    <div class="column main-content">
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
  </div>

  <keep-alive>
    <CatalogModal v-if="editorContext.currentView === EditorViewState.Catalog" :show="true"
      @close="editorContext.resetView()" />
  </keep-alive>

  <SubSkillTreeComponent v-if="editorContext.currentView === EditorViewState.SubSkillTree"
    @close="editorContext.resetView()" :skillTree="editorContext.activeSubSkillTree" />

  <ItemTooltip v-if="editorContext.lookingAt && !editorContext.isItemOnCursor()" :item="editorContext.lookingAt"
    :pos="editorContext.tooltipPosition" @close="editorContext.lookingAt = null"/>

  <TextModalComponent :isVisible="editorContext.currentView === EditorViewState.Restrictions" @close="resetViews">
    <p v-if="!editorContext.getSelectedCharapter()?.isBlackList()"> {{ editorContext.getSelectedCharapter()!.name }} only can use:</p>
    <div class="restrictions-list" v-if="editorContext.getSelectedCharapter()?.restrictions.size! > 0 && !editorContext.getSelectedCharapter()?.isBlackList()">
      <p v-for="(weapon, index) in editorContext.getSelectedCharapter()?.restrictions" :key="index">
        {{ weapon }}
      </p>
    </div>
    <p v-else>{{ editorContext.getSelectedCharapter()!.name }} can use any weapon.</p>
  </TextModalComponent>

  <TextModalComponent :isVisible="editorContext.currentView === EditorViewState.Info" @close="resetViews">
    <h1>Hero Siege Builder</h1>
    <p>All item attributes, as well as character names and skill trees, are obtained by parsing the Hero Siege wiki (<a
    href="https://herosiege.wiki.gg/">https://herosiege.wiki.gg/</a>) and may not be complete or accurate.</p>
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

enum Section {
  Charapters ="charaptersSection",
  Skills ="skillsSection",
  Inventory ="inventorySection",
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
    VersionComponent
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
}

  unmounted() {
    document.removeEventListener("mousemove", this.updateMousePosition);
    window.removeEventListener("resize", this.onResize);
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
    switch(action) {
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
/* Main */
.main-content {
  margin-left: 10%;
}
.container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  background: url("/img/editor/background.png");
  background-size: contain;
  width: 100%;
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

/* Modal*/
.info-modal,
.restrictions-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.info-content,
.restrictions-content {
  position: relative;
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
