// services/LocalStorageService.ts
import { deserialize, type BaseItem } from "../models/Equipment";

export interface SavedEquipmentSet {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  items: BaseItem[];
}

type StorageChangeCallback = () => void;

export class LocalStorageService {
  private static readonly SAVED_EQUIPMENT_KEY = 'custom_equipment_sets';
  private static changeListeners: StorageChangeCallback[] = [];

  /**
   * Register a callback to be called when storage changes
   */
  static onStorageChange(callback: StorageChangeCallback): void {
    this.changeListeners.push(callback);
  }

  /**
   * Remove a previously registered callback
   */
  static removeOnStorageChange(callback: StorageChangeCallback): void {
    this.changeListeners = this.changeListeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners that storage has changed
   */
  private static notifyListeners(): void {
    this.changeListeners.forEach(callback => callback());
  }

  static async getSavedEquipmentSets(): Promise<SavedEquipmentSet[]> {
    try {
      const savedSets = localStorage.getItem(this.SAVED_EQUIPMENT_KEY);
      if (!savedSets) return [];

      const parsedSets = JSON.parse(savedSets) as SavedEquipmentSet[];

      const deserializedSets = await Promise.all(
        parsedSets.map(async set => {
          const deserializedItems = await Promise.all(
            set.items.map(item => deserialize(item))
          );

          return {
            ...set,
            items: deserializedItems
          };
        })
      );

      return deserializedSets;
    } catch (error) {
      console.error('Error getting saved equipment sets:', error);
      return [];
    }
  }

  static async saveEquipmentSet(set: SavedEquipmentSet): Promise<boolean> {
    try {
      const sets = await this.getSavedEquipmentSets();
      const existingIndex = sets.findIndex(s => s.name === set.name);

      const serializableSet = {
        ...set,
        items: set.items.map(item => {
          if (typeof item.serialize === 'function') {
            return item.serialize();
          }

          return JSON.parse(JSON.stringify(item));
        }),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        sets[existingIndex] = serializableSet;
      } else {
        sets.push({
          ...serializableSet,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem(this.SAVED_EQUIPMENT_KEY, JSON.stringify(sets));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error saving equipment set:', error);
      return false;
    }
  }

  static async deleteEquipmentSet(name: string): Promise<boolean> {
    try {
      const sets = await this.getSavedEquipmentSets();
      const filteredSets = sets.filter(s => s.name !== name);

      if (sets.length === filteredSets.length) {
        return false;
      }

      localStorage.setItem(this.SAVED_EQUIPMENT_KEY, JSON.stringify(filteredSets));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error deleting equipment set:', error);
      return false;
    }
  }

  static async exportEquipmentSet(setName: string): Promise<void> {
    try {
      const sets = await this.getSavedEquipmentSets();
      const setToExport = sets.find(s => s.name === setName);

      if (!setToExport) {
        throw new Error(`Set with name "${setName}" not found`);
      }

      const dataStr = JSON.stringify(setToExport, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const exportFileName = `${setName.replace(/\s+/g, '_')}-preset.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting equipment set:', error);
      throw error;
    }
  }

  static async importEquipmentSet(file: File): Promise<SavedEquipmentSet> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const importedSet = JSON.parse(content) as SavedEquipmentSet;

          if (!importedSet.name || !Array.isArray(importedSet.items)) {
            throw new Error('Invalid equipment set format');
          }

          importedSet.updatedAt = new Date().toISOString();

          await this.saveEquipmentSet(importedSet);
          // No need to call notifyListeners here as it's called within saveEquipmentSet
          resolve(importedSet);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
  
  /**
   * Listen for localStorage changes from other tabs/windows
   */
  static initStorageEventListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.SAVED_EQUIPMENT_KEY) {
        this.notifyListeners();
      }
    });
  }
}

// Initialize storage event listener when the service is imported
LocalStorageService.initStorageEventListener();