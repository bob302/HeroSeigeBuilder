<template>
  <div class="equipment-editor">
    <!-- Left Column: Editor Slot and Buttons -->
    <div class="editor-column">
      <div class="editor-slot-wrapper">
        <EditorSlot ref="editorSlot" :slotName="slotConfig.slotName" @item-placed="handleItemPlaced"
          @item-updated="handleItemUpdated" @item-removed="handleItemRemoved" />

      </div>

      <div class="editor-actions">
        <button @click="addToInventory" :disabled="!currentEquipment || !isFormValid">Add to Inventory</button>
        <button @click="saveToSet" :disabled="!currentEquipment || !isFormValid">Save to Preset</button>
        <button @click="clear" :disabled="!currentEquipment">Clear</button>
      </div>
    </div>

    <!-- Right Column: Item Details or Guide -->
    <div class="details-column">
      <Transition name="slide-fade">
        <!-- Equipment Properties -->
        <div v-if="currentEquipment" class="table-wrapper">
          <div class="editor-table">
            <h3>Item Properties</h3>
            <table>
              <tbody>
                <!-- Name -->
                <tr>
                  <td>Name</td>
                  <td class="form-group">
                    <input v-model="formData.name" type="text" @input="validateForm"
                      :class="{ 'error-input': errors.name }" />
                    <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
                  </td>
                </tr>
                <!-- Size -->
                <tr>
                  <td>Size</td>
                  <td class="size-inputs form-group"
                    v-if="!(currentEquipment instanceof Socketable || currentEquipment instanceof CustomSocketable)">
                    <input v-model.number="formData.sizeWidth" min="1" max="4" type="number" placeholder="Width"
                      @input="validateForm" :class="{ 'error-input': errors.size }" />
                    <input v-model.number="formData.sizeHeight" min="1" max="4" type="number" placeholder="Height"
                      @input="validateForm" :class="{ 'error-input': errors.size }" />
                  </td>
                  <td v-else>
                    <p>Size of Socketable is always 1x1</p>
                  </td>
                  <div v-if="errors.size" class="error-message">{{ errors.size }}</div>
                </tr>
                <!-- Type -->
                <tr v-if="currentEquipment.type !== EquipmentType.Socketable">
                  <td>Type</td>
                  <td class="form-group">
                    <select v-model="formData.type" @change="validateForm" :class="{ 'error-input': errors.type }">
                      <option v-for="type in EquipmentType" :value="type">
                        {{ type }}
                      </option>
                    </select>
                    <div v-if="errors.type" class="error-message">{{ errors.type }}</div>
                  </td>
                </tr>
                <!-- Subtype -->
                <tr>
                  <td>Subtype</td>
                  <td class="form-group">
                    <select v-model="formData.subtype" @change="validateForm"
                      :class="{ 'error-input': errors.subtype }">
                      <option v-for="subtype in EquipmentSubtypes[formData.type]" :value="subtype">
                        {{ subtype }}
                      </option>
                    </select>
                  </td>
                </tr>
                <!-- Rarity -->
                <tr>
                  <td>Rarity</td>
                  <td class="form-group">
                    <select v-model="formData.rarity" @change="validateForm" :class="{ 'error-input': errors.rarity }">
                      <option v-for="rarity in EquipmentRarity" :value="rarity">
                        {{ rarity }}
                      </option>
                    </select>
                    <div v-if="errors.rarity" class="error-message">{{ errors.rarity }}</div>
                  </td>
                </tr>
                <!-- Tier -->
                <tr>
                  <td>Tier</td>
                  <td class="form-group">
                    <select v-model="formData.tier" @change="validateForm" :class="{ 'error-input': errors.tier }">
                      <option v-for="tier in EquipmentTier" :value="tier">
                        {{ tier }}
                      </option>
                    </select>
                    <div v-if="errors.tier" class="error-message">{{ errors.tier }}</div>
                  </td>
                </tr>
                <!-- Level -->
                <tr>
                  <td>Level</td>
                  <td class="form-group">
                    <input v-model.number="formData.level" min="0" max="100" type="number" @input="validateForm"
                      :class="{ 'error-input': errors.level }" />
                    <div v-if="errors.level" class="error-message">{{ errors.level }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Stats Section -->
          <div class="stats-section">
            <h3>Stats</h3>
            <div class="stats-grid">
              <div v-for="(stat, index) in currentEquipment.stats" :key="index" class="stat-item">
                {{ index + 1 }}
                <input v-model="stat.raw" type="text" @input="handleStatInput" />
                <button @click="removeStat(index)" class="remove-stat-btn">×</button>
              </div>
              <button v-if="currentEquipment?.stats" type="button" @click="addStat"
              :disabled="currentEquipment?.stats.length >= 20" class="add-stat-btn">Add Stat</button>
            </div>
          </div>
        </div>

        <!-- Guide View (when no item is selected) -->
        <div v-else class="guide-container">
          <h2>Item Editor Guide</h2>
          <p>If the available items does not meet your needs, you can modify them as you want.</p>
          <p>However, you cannot change the item's image...</p>
          <div class="guide-content">
            <div class="guide-section">
              <h3>Getting Started:</h3>
              <ol>
                <li>Drag and drop an item into the editor slot to start.</li>
                <li>Use the form to modify the equipment properties.</li>
                <li>Add stats using the "Add Stat" button.</li>
                <li>Save your changes or return the item to your inventory when finished.</li>
                <li>Also you can share your creations using presets.</li>
              </ol>
            </div>

            <div class="guide-section">
              <h3>Equipment Properties:</h3>
              <ul>
                <li>Name: Give your item a unique name</li>
                <li>Size: Set width and height (1-4)</li>
                <li>Type/Subtype: Choose from available categories</li>
                <li>Tier/Rarity: Set item Tier and Rarity</li>
                <li>Level: Specify item level requirement (0-100)</li>
              </ul>
            </div>

            <div class="guide-section">
              <h3>Stat Format:</h3>
              <ul>
                <li>Basic stats: "+5 Strength" or "15% Critical Chance"</li>
                <li>Range values: "+[5-10] Damage" becomes a "+5 Damage [5-10]"</li>
              </ul>
            </div>

            <div class="guide-section">
              <h3>Sockets:</h3>
              <p>Use different bracket types to specify socket types and amounts</p>
              <ul>
                <li>Regular parentheses () for standard sockets: "Socketed (2)"</li>
                <li>Curly braces {} for prismatic sockets: "Socketed {3}"</li>
                <li>You can combine different brackets to specify multiple socket types:</li>
                <li>Example: "Socketed (2){1}" sets 2 standard sockets and 1 prismatic socket to an item</li>
                <li>Example: "Socketed {2-4}(1-2)" sets 4 prismatic sockets and 2 standard socket to an item</li>
              </ul>
            </div>

            <div class="guide-section">
              <h3>Special Stats:</h3>
              <p>The following special stats are automatically formatted with custom styling:</p>
              <ul class="special-stats-list">
                <li class="stat-allskills">+1 to All Skills</li>
                <li class="stat-to-fire">+2 to Fire Skills</li>
                <li class="stat-to-cold">+2 to Cold Skills</li>
                <li class="stat-to-lightning">+2 to Lightning Skills</li>
                <li class="stat-to-poison">+2 to Poison Skills</li>
                <li class="stat-to-physical">+2 to Physical Skills</li>
                <li class="stat-to-arcane">+2 to Arcane Skills</li>
                <li class="stat-unholy">Unholy Stat</li>
                <li class="stat-unbreakable">Unbreakable</li>
                <li class="stat-random-skill">Random Skill Element</li>
                <li class="stat-augment">[Augment]</li>
              </ul>
            </div>

            <div class="guide-section">
              <h3>Tips:</h3>
              <ul>
                <li>Each item can have a maximum of 20 stats</li>
                <li>Maximum amount of any sockets combined is 16</li>
                <li>Maximum stat length is 128 chars</li>
                <li>You don't need to specify styling - special stats are detected and styled automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Save to Set Modal -->
    <div v-if="showSaveToSetModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Save to Preset</h3>

        <div class="form-group" v-if="equipmentSets.length > 0">
          <label for="saveSetSelect">Choose a set:</label>
          <select id="saveSetSelect" v-model="selectedSetToSave">
            <option value="">New Preset</option>
            <option v-for="set in equipmentSets" :key="set.name" :value="set.name">
              {{ set.name }} ({{ set.items.length }} items)
            </option>
          </select>
        </div>

        <div class="form-group" v-if="!selectedSetToSave">
          <label for="newSetName">New Preset Name:</label>
          <input id="newSetName" v-model="newSetDetails.name" type="text" placeholder="My Custom Preset" />
        </div>

        <div class="form-group" v-if="!selectedSetToSave">
          <label for="newSetDescription">Description:</label>
          <textarea id="newSetDescription" v-model="newSetDetails.description"
            placeholder="Describe your equipment set"></textarea>
        </div>

        <div class="form-actions">
          <button @click="cancelSaveToSet" class="cancel-btn">Cancel</button>
          <button @click="confirmSaveToSet" class="save-btn" :disabled="!selectedSetToSave && !newSetDetails.name">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch, toNative } from "vue-facing-decorator";
import { Equipment, Socketable, type BaseItem, type Stat } from "../models/Equipment";
import { EquipmentSlot, type SlotConfig } from "../models/EquipmentSlot";
import EditorSlot from "./EditorSlot.vue";
import type EditorContext from "../models/EditorContext";
import { Item } from "../models/Item";
import { Point2D } from "../models/Point2D";
import { ItemParser } from "../parser/ItemParser";
import { EquipmentType, EquipmentRarity, EquipmentTier, EquipmentSubtypes } from "../util/Enums";
import { createSocket, CustomSocketable } from "../models/Equipment";
import { LocalStorageService, type SavedEquipmentSet } from "../service/LocalStorageService";

interface ValidationErrors {
  name?: string;
  size?: string;
  type?: string;
  subtype?: string;
  rarity?: string;
  tier?: string;
  level?: string;
}

interface EquipmentFormData {
  name: string;
  sizeWidth: number;
  sizeHeight: number;
  type: EquipmentType;
  subtype: string;
  rarity: EquipmentRarity;
  tier: EquipmentTier;
  level: number;
  stats: Stat[];
}

@Component({ components: { EditorSlot } })
class EquipmentEditor extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  currentEquipment: BaseItem | null = null;

  rawItemJson: string = '';

  showSaveToSetModal: boolean = false;
  equipmentSets: SavedEquipmentSet[] = [];
  selectedSetToSave: string = '';
  newSetDetails: { name: string; description: string } = {
    name: '',
    description: ''
  };

  formData: EquipmentFormData = {
    name: '',
    sizeWidth: 1,
    sizeHeight: 1,
    type: EquipmentType.Weapon,
    subtype: '',
    rarity: EquipmentRarity.Common,
    tier: EquipmentTier.S,
    level: 1,
    stats: []
  };

  errors: ValidationErrors = {};

  updateFormFromEquipment(equipment: BaseItem): void {
    this.formData = {
      name: equipment.name,
      sizeWidth: equipment.size.width,
      sizeHeight: equipment.size.height,
      type: equipment.type,
      subtype: equipment.subtype,
      rarity: equipment.rarity,
      tier: equipment.tier,
      level: equipment.level,
      stats: equipment.stats ? [...equipment.stats] : []
    };
    
    this.validateForm();
  }

  validateForm(): boolean {
    this.errors = {};
    
    if (!this.formData.name) {
      this.errors.name = 'Name is required';
    } else if (this.formData.name.length < 1) {
      this.errors.name = 'Name must be at least 1 character';
    } else if (this.formData.name.length > 128) {
      this.errors.name = 'Name must not exceed 128 characters';
    }
    
    // Size validation
    const { sizeWidth, sizeHeight } = this.formData;
    if (!sizeWidth || !sizeHeight) {
      this.errors.size = 'Both width and height are required';
    } else if (sizeWidth < 1 || sizeWidth > 4 || sizeHeight < 1 || sizeHeight > 4) {
      this.errors.size = 'Width and height must be between 1 and 4';
    }
    
    // Level validation
    const level = this.formData.level;
    if (level === null || level === undefined) {
      this.errors.level = 'Level is required';
    } else if (level < 0 || level > 100) {
      this.errors.level = 'Level must be between 0 and 100';
    }
    
    // Type validation
    if (!this.formData.type) {
      this.errors.type = 'Type is required';
    }
    
    // Subtype validation
    if (!this.formData.subtype) {
      this.errors.subtype = 'Subtype is required';
    }
    
    // Rarity validation
    if (!this.formData.rarity) {
      this.errors.rarity = 'Rarity is required';
    }
    
    // Tier validation
    if (!this.formData.tier) {
      this.errors.tier = 'Tier is required';
    }
    
    return this.isFormValid;
  }

  // Apply form data to the equipment
  applyFormToEquipment(): void {
    if (!this.currentEquipment || !this.isFormValid) return;
    
    this.currentEquipment.name = this.formData.name;
    this.currentEquipment.size = {
      width: this.formData.sizeWidth,
      height: this.formData.sizeHeight
    };
    this.currentEquipment.type = this.formData.type;
    this.currentEquipment.subtype = this.formData.subtype;
    this.currentEquipment.rarity = this.formData.rarity;
    this.currentEquipment.tier = this.formData.tier;
    this.currentEquipment.level = this.formData.level;
    
    this.updateSlotItem();
  }

  get isFormValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  get EquipmentType() {
    return EquipmentType;
  }

  get EquipmentRarity() {
    return EquipmentRarity;
  }

  get EquipmentTier() {
    return EquipmentTier;
  }

  get EquipmentSubtypes() {
    return EquipmentSubtypes;
  }

  get Socketable() {
    return Socketable
  }

  get CustomSocketable() {
    return CustomSocketable
  }


  get slotConfig(): SlotConfig {
    return EquipmentSlot.editorSlotConfig();
  }

  get editorSlot() {
    return this.$refs.editorSlot as any;
  }

  get slotItem(): Item | null {
    return this.editorSlot?.equipmentSlot?.slot?.item || null;
  }

  mounted() {
    this.$nextTick(() => {
      if (this.slotItem && this.slotItem.data) {
        this.currentEquipment = this.slotItem.data as Equipment;
        this.updateFormFromEquipment(this.currentEquipment);
      }
    });
  }

  handleStatInput(): void {
    this.updateSlotItem();

    if (!this.currentEquipment) return;

    const socketed = ItemParser.getSocketedStat(this.currentEquipment.stats)

    if (socketed) {
      this.updateSocketsFromStat(socketed);
    }
  }

  updateSocketsFromStat(socketedStat: Stat): void {
    if (!(this.currentEquipment instanceof Equipment)) return
    if (!this.currentEquipment || !this.currentEquipment.sockets) return;

    ItemParser.processSocketStat(socketedStat, this.currentEquipment);
    this.updateSlotItem();
  }


  handleItemPlaced(equipment: Equipment): void {
    this.currentEquipment = JSON.parse(JSON.stringify(equipment));
  }

  handleItemUpdated(item: Item): void {
    if (item && item.data) {
      this.currentEquipment = item.data as Equipment;
    }
  }

  handleItemRemoved(): void {
    this.clear()
  }


  updateSlotItem(): void {
    if (!this.isFormValid) return
    
    if (!this.currentEquipment || !this.editorSlot || !this.slotItem) return;

    this.slotItem.data = this.currentEquipment;
  }

  updateSocketsList(): void {
    if (!(this.currentEquipment instanceof Equipment)) return
    
    if (!this.currentEquipment || !this.currentEquipment.sockets) return;

    const currentAmount = this.currentEquipment.sockets.amount;
    const currentList = this.currentEquipment.sockets.list;

    if (currentList.length < currentAmount) {
      for (let i = currentList.length; i < currentAmount; i++) {
        currentList.push(createSocket(false));
      }
    }
    else if (currentList.length > currentAmount) {
      this.currentEquipment.sockets.list = currentList.slice(0, currentAmount);
    }

    this.updateSlotItem();
  }

  addStat(): void {
    if (!this.currentEquipment) return;

    const stat = 'Empty Stat'
    this.currentEquipment.addStat(stat);

    this.$nextTick(() => this.updateSlotItem());
  }

  removeStat(index: number): void {
    if (!this.currentEquipment) return;

    this.currentEquipment.removeStat(index);

    this.$nextTick(() => this.updateSlotItem());
  }

  addToInventory() {
  if (!this.isFormValid) return
  if (!this.currentEquipment) return;
  
  let itemToAdd = this.currentEquipment;
  
  // Check if the current equipment is a Socketable
  if (this.currentEquipment instanceof Socketable) {
    // If it's already a Socketable, create a CustomSocketable from it
    const socketable = this.currentEquipment;
    
    // Create a new CustomSocketable with all properties from the original Socketable
    itemToAdd = new CustomSocketable({
      uuid: socketable.uuid,
      name: socketable.name,
      image: socketable.image,
      isLoading: socketable.isLoading,
      size: { ...socketable.size },
      type: socketable.type,
      subtype: socketable.subtype,
      rarity: socketable.rarity,
      tier: socketable.tier,
      level: socketable.level,
      stats: socketable.stats.map(stat => ({ ...stat }))
    });
  } else {
    // If it's not a Socketable, just clone it
    itemToAdd = this.currentEquipment.clone();
  }

  this.editorContext.mainInventory.addItem(
    new Item(
      itemToAdd,
      new Point2D(itemToAdd.size.width, itemToAdd.size.height)
    )
  );
}

  clear() {
    this.editorContext.getEditorSlot()?.clear()
    this.currentEquipment = null;
  }

  async saveToSet(): Promise<void> {
    if (!this.isFormValid) return

    if (!this.currentEquipment) return;

    this.equipmentSets = await LocalStorageService.getSavedEquipmentSets();

    this.selectedSetToSave = '';
    this.newSetDetails = { name: '', description: '' };

    this.showSaveToSetModal = true;
  }

  cancelSaveToSet(): void {
    this.showSaveToSetModal = false;
  }

  confirmSaveToSet(): void {
    if (!this.currentEquipment) {
      this.showSaveToSetModal = false;
      return;
    }

    const itemToSave = this.currentEquipment.clone();

    if (this.selectedSetToSave) {
      this.addItemToExistingSet(this.selectedSetToSave, itemToSave);
    } else if (this.newSetDetails.name) {
      this.createNewSetWithItem(itemToSave);
    }

    this.showSaveToSetModal = false;
  }

  private async addItemToExistingSet(setName: string, item: BaseItem): Promise<void> {
    if (!this.isFormValid) return
    const sets = LocalStorageService.getSavedEquipmentSets();
    const setToUpdate = (await sets).find(s => s.name === setName);    

    if (item instanceof Socketable) {
    // If it's already a Socketable, create a CustomSocketable from it
    const socketable = item;
    
    item = new CustomSocketable({
      uuid: socketable.uuid,
      name: socketable.name,
      image: socketable.image,
      isLoading: socketable.isLoading,
      size: { ...socketable.size },
      type: socketable.type,
      subtype: socketable.subtype,
      rarity: socketable.rarity,
      tier: socketable.tier,
      level: socketable.level,
      stats: socketable.stats.map(stat => ({ ...stat }))
    });
  }

    if (!setToUpdate) {
      console.error(`Set "${setName}" not found`);
      return;
    }

    const existingItemIndex = setToUpdate.items.findIndex(i => i.name === item.name);

    if (existingItemIndex >= 0) {
      setToUpdate.items[existingItemIndex] = item;
    } else {
      setToUpdate.items.push(item);
    }

    setToUpdate.updatedAt = new Date().toISOString();

    LocalStorageService.saveEquipmentSet(setToUpdate);

    alert(`Item "${item.name}" saved to set "${setName}"`);
  }


  private createNewSetWithItem(item: BaseItem): void {
    if (item instanceof Socketable) {
    // If it's a Socketable, create a CustomSocketable from it
    const socketable = item;
    
    item = new CustomSocketable({
      uuid: socketable.uuid,
      name: socketable.name,
      image: socketable.image,
      isLoading: socketable.isLoading,
      size: { ...socketable.size },
      type: socketable.type,
      subtype: socketable.subtype,
      rarity: socketable.rarity,
      tier: socketable.tier,
      level: socketable.level,
      stats: socketable.stats.map(stat => ({ ...stat }))
    });
    }
    
    const newSet: SavedEquipmentSet = {
      name: this.newSetDetails.name,
      description: this.newSetDetails.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [item]
    };

    LocalStorageService.saveEquipmentSet(newSet);

    alert(`New preset "${newSet.name}" created with item "${item.name}"`);
  }

  @Watch('currentEquipment')
  onEquipmentChanged(newEquipment: BaseItem | null) {
    if (newEquipment) {
      this.updateFormFromEquipment(newEquipment);
    }
  }
  
  @Watch('slotItem')
  onSlotItemChange(newItem: Item | null): void {
    if (!newItem) {
      this.handleItemRemoved();
    }
  }

  @Watch('formData', {deep: true})
  onFormDataChanged() {
    this.applyFormToEquipment()
  }

  @Watch('formData.type')
  onTypeChanged(newType: EquipmentType) {
    const subtypeOptions = EquipmentSubtypes[newType] || [];
    
    const isSubtypeValid = subtypeOptions.includes(this.formData.subtype);
    
    if (!this.formData.subtype || !isSubtypeValid) {
      if (subtypeOptions.length > 0) {
        this.formData.subtype = subtypeOptions[0];
      }
    }
  }
}

export default toNative(EquipmentEditor)
</script>

<style scoped>
/* Two-column layout */
.equipment-editor {
  display: flex;
  width: 100%;
  max-height: 50vh;
  background-color: var(--color-background);
  overflow: hidden;
}

/* Left column - Editor slot and buttons */
.editor-column {
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 3%;
}

.editor-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.editor-table tr, .editor-table td {
  padding: 0.4rem;
}

/* Right column - Item details or guide */
.details-column {
  flex: 1;
  overflow-y: auto;
}

/* Details container */
.details-container {
  display: flex;
  flex-direction: row;
}


/* Table styles */
.table-wrapper {
  display: flex;
  justify-content: space-evenly;
  overflow-y: auto;
}

.editor-slot-wrapper {
  width: 10rem;
  height: 10rem;
}

.size-inputs {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

/* Stats section */
.stats-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  place-items: center;
  gap: 0.5rem;
}

.add-stat-btn {
  height: 75%;
  grid-row: 1 / 1; /* Places the button in the last row */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-item input {
  flex: 1;
  padding: 0.25rem 0.5rem;
}

.remove-stat-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Guide container */
.guide-container {
  height: 100%;
  overflow-y: auto;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guide-section {
  background-color: var(--color-background-soft, rgba(0,0,0,0.03));
  border-radius: 8px;
  padding: 1rem;
}

.guide-section h3 {
  text-align: start;
}

.special-stats-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-background, white);
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea,
.stat-item input {
  text-align: center;
  width: 100%;
  padding: 0.5rem 0 0.5rem;
  border: 1px solid var(--color-border, #ccc);
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.error-input {
  border: 1px solid #ff3860 !important;
  box-shadow: 0 0 0 1px #ff3860;
}

.error-message {
  color: var(--color-unholy);
  font-size: 0.8rem;
  margin-top: 2px;
  display: block;
}

.cancel-btn {
  background-color: var(--color-secondary, #718096);
}

.save-btn {
  background-color: var(--color-success, #48bb78);
}

/* Common styles */
button {
  padding: 0.5rem;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: var(--color-button-hover, #2d3748);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transition effect */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .equipment-editor {
    flex-direction: column;
    max-height: none;
  }

  .editor-column {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border, #ccc);
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
  }
  .table-wrapper {
    flex-direction: column;
    justify-content: center;
    padding: 1rem 0 2rem;
  }

  .editor-table {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .editor-column {
    padding: 1.5rem 0 1.5rem;
  }
}
</style>