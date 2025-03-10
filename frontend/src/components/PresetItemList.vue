<template>
  <div class="mod-list">
    <div class="mod-list-header">
      <h2>Item Presets</h2>
      <div class="storage-info">
        <div class="storage-bar">
          <div class="storage-used" :style="{ width: storagePercentage + '%' }"></div>
        </div>
        <span class="storage-text">{{ storageUsedMB.toFixed(2) }} MB / {{ storageLimitMB }} MB ({{ storagePercentage }}%)</span>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="create-btn">New</button>
        <label class="import-btn">
          Import
          <input type="file" accept=".json" @change="handleImportFile" hidden />
        </label>
      </div>
    </div>

    <div v-if="equipmentSets.length === 0" class="empty-library">
      <p>No saved presets yet.</p>
      <p>Create or import a preset to get started.</p>
    </div>
    
    <div v-else class="equipment-sets">
      <div v-for="set in equipmentSets" :key="set.name" class="equipment-set-card">
        <div class="set-info">
          <h3 style="color: black">{{ set.name }}</h3>
          <p class="set-description">{{ set.description }}</p>
          <p class="set-meta">
            Items: {{ set.items.length }} | 
            Size: {{ calculateSetSize(set).toFixed(2) }} KB
          </p>
          <p class="set-meta">
            Updated: {{ formatDate(set.updatedAt) }}
          </p>
        </div>
        <div class="set-actions">
          <button @click="loadSet(set)" class="action-btn load-btn">Load</button>
          <button @click="exportSet(set.name)" class="action-btn export-btn">Export</button>
          <button @click="confirmDelete(set.name)" class="action-btn delete-btn">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Create New Equipment Set</h3>
        <div class="form-group">
          <label for="setName">Set Name:</label>
          <input id="setName" v-model="newSet.name" type="text" placeholder="My Custom Set" />
        </div>
        <div class="form-group">
          <label for="setDescription">Description:</label>
          <textarea id="setDescription" v-model="newSet.description" placeholder="Describe your equipment set"></textarea>
        </div>
        <div class="form-actions">
          <button @click="showCreateModal = false" class="cancel-btn">Cancel</button>
          <button @click="createNewSet" class="save-btn" :disabled="!newSet.name">Save</button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete the preset "{{ setToDelete }}"?</p>
        <p>This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteSet" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, toNative } from "vue-facing-decorator";
import { LocalStorageService, type SavedEquipmentSet } from "../service/LocalStorageService";
import type EditorContext from "../models/EditorContext";
import type { BaseItem } from "../models/Equipment";

@Component({emits: ['open-catalog-with-set']})
class PresetItemList extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  // Use a private property with getter
  private _equipmentSets: SavedEquipmentSet[] = [];
  
  // Storage info
  storageUsedMB: number = 0;
  storageLimitMB: number = 10; // localStorage limit is typically around 5-10MB
  storagePercentage: number = 0;
  
  // Getter for equipment sets
  get equipmentSets(): SavedEquipmentSet[] {
    return this._equipmentSets;
  }
  
  showCreateModal: boolean = false;
  showDeleteModal: boolean = false;
  setToDelete: string = '';
  
  newSet: { name: string; description: string } = {
    name: '',
    description: ''
  };

  // Reference to the storage change handler
  private storageChangeHandler: (() => void) | null = null;

  mounted() {
    this.loadEquipmentSets();
    this.updateStorageStats();
    
    // Register storage change handler
    this.storageChangeHandler = () => {
      this.loadEquipmentSets();
      this.updateStorageStats();
    };
    LocalStorageService.onStorageChange(this.storageChangeHandler);
  }

  beforeUnmount() {
    // Clean up the storage change handler when component is destroyed
    if (this.storageChangeHandler) {
      LocalStorageService.removeOnStorageChange(this.storageChangeHandler);
      this.storageChangeHandler = null;
    }
  }

  async loadEquipmentSets() {
    this._equipmentSets = await LocalStorageService.getSavedEquipmentSets();
  }

  /**
   * Calculate and update storage statistics
   */
  updateStorageStats() {
    // Calculate total size of all stored data in localStorage
    let totalStorageSize = 0;
    
    // Consider only keys relevant to equipment sets
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('equipmentSet:')) {
        const value = localStorage.getItem(key) || '';
        totalStorageSize += this.getStringByteSize(key) + this.getStringByteSize(value);
      }
    }
    
    // Convert to MB
    this.storageUsedMB = totalStorageSize / (1024 * 1024);
    
    // Calculate percentage
    this.storagePercentage = Math.min(100, Math.round((this.storageUsedMB / this.storageLimitMB) * 100));
  }
  
  /**
   * Calculate the size of a string in bytes
   */
  getStringByteSize(str: string): number {
    // A rough estimate using length * 2 for UTF-16 encoding
    return str.length * 2;
  }
  
  /**
   * Calculate the size of an equipment set in KB
   */
  calculateSetSize(set: SavedEquipmentSet): number {
    const jsonString = JSON.stringify(set);
    const setKey = `equipmentSet:${set.name}`;
    const totalBytes = this.getStringByteSize(setKey) + this.getStringByteSize(jsonString);
    return totalBytes / 1024; // Convert to KB
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
      return 'Unknown date';
    }
  }

  /**
   * Create a new item set
   */
  async createNewSet() {
    if (!this.newSet.name) return;

    // Get current item from editor
    const currentItem = this.editorContext.getEditorSlot()?.slot?.item;
    const items: BaseItem[] = [];
    
    if (currentItem && currentItem.data) {
      items.push(currentItem.data as BaseItem);
    }

    const newSet: SavedEquipmentSet = {
      name: this.newSet.name,
      description: this.newSet.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items
    };

    // Check if there's enough space
    const newSetSize = this.getStringByteSize(JSON.stringify(newSet)) / (1024 * 1024); // in MB
    if (this.storageUsedMB + newSetSize > this.storageLimitMB) {
      alert(`Not enough space in local storage. The new set requires ${newSetSize.toFixed(2)} MB, but only ${(this.storageLimitMB - this.storageUsedMB).toFixed(2)} MB is available.`);
      return;
    }

    await LocalStorageService.saveEquipmentSet(newSet);
    // No need to manually reload equipment sets, the storage change callback will handle it
    this.showCreateModal = false;
    this.newSet = { name: '', description: '' };
  }

  /**
   * Load a set into the editor
   */
  loadSet(set: SavedEquipmentSet) {    
    if (set.items.length === 0) {
      alert('This equipment set is empty');
      return;
    }

    // Instead of loading the first item, open the catalog with items from the set
    this.$emit('open-catalog-with-set', set);
  }

  /**
   * Export a set to a file
   */
  exportSet(setName: string) {
    try {
      LocalStorageService.exportEquipmentSet(setName);
    } catch (error) {
      alert(`Error exporting set: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Prepare for set deletion
   */
  confirmDelete(setName: string) {
    this.setToDelete = setName;
    this.showDeleteModal = true;
  }

  /**
   * Delete an equipment set
   */
  async deleteSet() {
    if (this.setToDelete) {
      await LocalStorageService.deleteEquipmentSet(this.setToDelete);
      // No need to manually reload equipment sets, the storage change callback will handle it
      this.showDeleteModal = false;
      this.setToDelete = '';
    }
  }

  /**
   * Handle file import
   */
  async handleImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    try {
      // Check file size before importing
      const fileSizeMB = file.size / (1024 * 1024);
      if (this.storageUsedMB + fileSizeMB > this.storageLimitMB) {
        alert(`Not enough space in local storage. The file requires approximately ${fileSizeMB.toFixed(2)} MB, but only ${(this.storageLimitMB - this.storageUsedMB).toFixed(2)} MB is available.`);
        input.value = '';
        return;
      }
      
      const importedSet = await LocalStorageService.importEquipmentSet(file);
      // No need to manually reload equipment sets, the storage change callback will handle it
      alert(`Successfully imported set: ${importedSet.name}`);
      
      // Reset input for possible re-upload of the same file
      input.value = '';
    } catch (error) {
      alert(`Error importing file: ${error instanceof Error ? error.message : String(error)}`);
      input.value = '';
    }
  }
}

export default toNative(PresetItemList)
</script>

<style scoped>
.mod-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.mod-list-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, #ccc);
}

.mod-list-header h2 {
  margin: 0;
  font-size: 1rem;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.equipment-sets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.equipment-set-card {
  border: 1px solid var(--color-border, #ccc);
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--color-card-background, #f8f9fa);
}

.set-info {
  margin-bottom: 0.5rem;
}

.set-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.set-description {
  margin: 0 0 0.25rem 0;
  color: var(--color-text-secondary, #666);
  font-size: 0.75rem;
}

.set-meta {
  font-size: 0.7rem;
  color: var(--color-text-muted, #999);
  margin: 0;
}

.set-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-btn {
  flex: 1;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}

.load-btn {
  background-color: var(--color-primary, #4a5568);
}

.export-btn {
  background-color: var(--color-secondary, #718096);
}

.delete-btn {
  background-color: var(--color-danger, #e53e3e);
}

.create-btn, .import-btn {
  background-color: var(--color-primary, #4a5568);
  width: 100%;
}

.import-btn {
  display: flex;
  justify-content: center;
  background-color: var(--color-secondary, #718096);
}

.empty-library {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted, #999);
}

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
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-btn {
  background-color: var(--color-secondary, #718096);
}

.save-btn {
  background-color: var(--color-success, #48bb78);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Storage info styles */
.storage-info {
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.storage-bar {
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-background-alt, #edf2f7);
  border-radius: 0.25rem;
  overflow: hidden;
}

.storage-used {
  height: 100%;
  background-color: var(--color-info, #4299e1);
  transition: width 0.3s ease;
}

.storage-text {
  font-size: 0.7rem;
  color: var(--color-text-muted, #718096);
  text-align: right;
}

/* Change color based on storage usage */
.storage-used[style*="width: 8"] { background-color: var(--color-warning, #ed8936); }
.storage-used[style*="width: 9"] { background-color: var(--color-danger, #e53e3e); }
</style>