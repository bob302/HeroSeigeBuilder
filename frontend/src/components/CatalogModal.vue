<template>
  <div class="catalog-modal" @click.self="close">
    <div v-if="isMobile" class="catalog-toggle-filters">
      <button @click="toggleFilters">
        <i class="fa-solid fa-filter"></i>
      </button>
    </div>
    <div class="modal-content">
      <div class="filters" v-if="filtersVisible">
        <div class="filter-wrapper" v-if="setItems.length > 0">
          <p class="desktop-text">Source:</p>
          <select v-model="filters.itemSource">
            <option value="catalog">Full Catalog</option>
            <option value="set">Set: {{ setName }}</option>
          </select>
        </div>

        <div class="filter-wrapper">
          <p class="desktop-text">Type:</p>
          <select v-model="filters.typeFilter">
            <option :value="null">Any</option>
            <option v-for="type in EquipmentType" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Subtype:</p>
          <select v-model="filters.subtypeFilter">
            <option :value="null">any</option>
            <option v-for="subtype in availableSubtypes" :value="subtype">
              {{ subtype }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Rarity:</p>
          <select v-model="filters.rarityFilter">
            <option :value="null">any</option>
            <option v-for="rarity in EquipmentRarity" :value="rarity">
              {{ rarity }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Tier:</p>
          <select v-model="filters.tierFilter">
            <option :value="null">any</option>
            <option v-for="tier in EquipmentTier" :value="tier">
              {{ tier }}
            </option>
          </select>
        </div>

        <div class="filter-wrapper">
          <p class="desktop-text">Level:</p>
          <select v-model="filters.levelSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Sockets:</p>
          <select v-model="filters.socketsSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div class="filter-wrapper" v-if="filters.typeFilter === EquipmentType.Weapon">
          <p class="desktop-text">1-Handed?:</p>
          <select v-model="filters.oneHandedFilter">
            <option value="">any</option>
            <option value="1-Handed">1-Handed</option>
            <option value="2-Handed">2-Handed</option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Show Sockets:</p>
          <img class="sockets-button"
            :src="showSockets ? '/img/editor/socket-button-show.png' : '/img/editor/socket-button-hide.png'"
            @click="showSockets = !showSockets" />
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Search by Name:</p>
          <input type="text" v-model="filters.nameFilter" placeholder="by Name" @input="debouncedUpdateFilters" />
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Search by Stat:</p>
          <input type="text" v-model="filters.statsFilter" placeholder="by Stat" @input="debouncedUpdateFilters" />
        </div>
      </div>

      <div class="catalog-wrapper">
        <div v-if="isLoading" class="loading-overlay">Loading items...</div>

        <EquipmentCatalog v-else :catalogItems="filteredCatalogItems"
          :itemBackgroundSrc="`/img/editor/item-background.png`" :showSockets="showSockets" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue, Watch } from "vue-facing-decorator";
import {
  Equipment,
  WeaponEquipment,
  BaseItem,
  type EquipmentSubtype,
} from "../models/Equipment";
import type EditorContext from "../models/EditorContext";
import EquipmentCatalog from "./EquipmentCatalog.vue";
import { equipmentService } from "../service/EquipmentService";
import { EquipmentRarity, EquipmentSubtypes, EquipmentTier, EquipmentType } from "../util/Enums";

// Define filter state interface
interface FilterState {
  itemSource: "catalog" | "set";
  nameFilter: string;
  typeFilter: EquipmentType | null;
  subtypeFilter: EquipmentSubtype | null;
  rarityFilter: EquipmentRarity | null;
  tierFilter: EquipmentTier | null;
  statsFilter: string;
  levelSort: "asc" | "desc" | "";
  socketsSort: "asc" | "desc" | "";
  oneHandedFilter: "1-Handed" | "2-Handed" | "";
}

@Component({
  components: {
    EquipmentCatalog,
  },
  emits: ["close"],
})
class CatalogModal extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ default: () => [] })
  readonly setItems!: BaseItem[];
  
  @Prop({ default: '' })
  readonly setName!: string;

  private loadedTypes = new Set<string>();
  private itemCache: Record<string, BaseItem[]> = {};
  private lastFilterHash = '';
  
  public isLoading = false;
  public showSockets = false;
  public isMobile: boolean = false;
  public filtersVisible: boolean = true;
  public filteredCatalogItems: BaseItem[] = [];

  public filters: FilterState = {
    itemSource: "catalog",
    nameFilter: "",
    typeFilter: EquipmentType.Socketable,
    subtypeFilter: null,
    rarityFilter: null,
    tierFilter: null,
    statsFilter: "",
    levelSort: "",
    socketsSort: "",
    oneHandedFilter: "",
  };
  

  private debounceTimer: number | null = null;
  private updateInterval: number | null = null;
  private pendingTypesToLoad: EquipmentType[] = [];
  private isLoadingTypes = false;

  created() {
    this.updateCatalogItems();
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
  
  get availableSubtypes(): EquipmentSubtype[] {
    if (this.filters.typeFilter === null) {
      return [];
    }
    return EquipmentSubtypes[this.filters.typeFilter] || [];
  }

  debouncedUpdateFilters() {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.updateCatalogItems();
    }, 300);
  }


  private getFilterHash(): string {
    return JSON.stringify(this.filters);
  }

  async updateCatalogItems() {

  if (this.filters.itemSource === "set" && this.setItems.length > 0) {
    this.applyFiltersToSetItems();
    return;
  }
  
  const filterHash = this.getFilterHash();
  const isAnyTypeFilter = this.filters.typeFilter === null;
  
  if (filterHash === this.lastFilterHash && this.filteredCatalogItems.length > 0 && !isAnyTypeFilter) {
    return;
  }
  
  this.lastFilterHash = filterHash;
  
  if (!equipmentService.isInitialized) {
    await equipmentService.initialize();
  }

  await this.loadRequiredTypes();
  
  let items: BaseItem[] = [];
  
  if (this.filters.typeFilter === null) {

    items = [];
    for (const loadedType of this.loadedTypes) {
      if (this.itemCache[loadedType]) {
        items = [...items, ...this.itemCache[loadedType]];
      }
    }

    if (items.length === 0) {
      items = await equipmentService.getAllItemsAsync();
    }
  } else {
    const cacheKey = this.filters.typeFilter.toString();
    if (this.itemCache[cacheKey]) {
      items = this.itemCache[cacheKey];
    } else {
      items = await equipmentService.getItemsAsync(this.filters.typeFilter);
      this.itemCache[cacheKey] = [...items]; 
    }
  }

  this.filteredCatalogItems = this.applyFilters(items);
}

  private applyFilters(items: BaseItem[]): BaseItem[] {
    const nameRegex = new RegExp(this.filters.nameFilter, "i");
    const statsRegex = new RegExp(this.filters.statsFilter, "i");

    let filtered = items.filter((item) => {
      const matchesName = !this.filters.nameFilter || nameRegex.test(item.name);
      const matchesType = !this.filters.typeFilter || item.type === this.filters.typeFilter;
      const matchesSubtype = !this.filters.subtypeFilter || item.subtype === this.filters.subtypeFilter;
      const matchesRarity = !this.filters.rarityFilter || item.rarity === this.filters.rarityFilter;
      const matchesTier = !this.filters.tierFilter || item.tier === this.filters.tierFilter;
      const matchesStats = !this.filters.statsFilter || item.stats.some((stat) => statsRegex.test(stat.raw));
      
      let matchesHanded = true;
      if (item instanceof WeaponEquipment && this.filters.oneHandedFilter) {
        const handedType = item.weaponStats.twoHanded ? "2-Handed" : "1-Handed";
        matchesHanded = this.filters.oneHandedFilter === handedType;
      }

      return (
        matchesName &&
        matchesType &&
        matchesSubtype &&
        matchesRarity &&
        matchesTier &&
        matchesStats &&
        matchesHanded
      );
    });

    this.applySorting(filtered);
    
    return filtered;
  }
  

  private applySorting(items: BaseItem[]): void {

    if (this.filters.levelSort) {
      items.sort((a, b) => {
        const aLevel = a.level || 0;
        const bLevel = b.level || 0;
        return this.filters.levelSort === "asc" ? aLevel - bLevel : bLevel - aLevel;
      });
    }

    if (this.filters.socketsSort) {
      items.sort((a, b) => {
        const aMax = (a as Equipment).sockets?.max || 0;
        const bMax = (b as Equipment).sockets?.max || 0;
        return this.filters.socketsSort === "asc" ? aMax - bMax : bMax - aMax;
      });
    }
  }
  
  private applyFiltersToSetItems(): void {
    if (this.setItems.length === 0) return;
    
    this.filteredCatalogItems = this.setItems.filter(item => {
      const nameRegex = new RegExp(this.filters.nameFilter, "i");
      const statsRegex = new RegExp(this.filters.statsFilter, "i");
      
      const matchesName = !this.filters.nameFilter || nameRegex.test(item.name);
      const matchesType = !this.filters.typeFilter || item.type === this.filters.typeFilter;
      const matchesSubtype = !this.filters.subtypeFilter || item.subtype === this.filters.subtypeFilter;
      const matchesRarity = !this.filters.rarityFilter || item.rarity === this.filters.rarityFilter;
      const matchesTier = !this.filters.tierFilter || item.tier === this.filters.tierFilter;
      const matchesStats = !this.filters.statsFilter || item.stats.some(stat => statsRegex.test(stat.raw));
      
      let matchesHanded = true;
      if (item instanceof WeaponEquipment && this.filters.oneHandedFilter) {
        const handedType = item.weaponStats.twoHanded ? "2-Handed" : "1-Handed";
        matchesHanded = this.filters.oneHandedFilter === handedType;
      }
      
      return matchesName && matchesType && matchesSubtype && 
             matchesRarity && matchesTier && matchesStats && matchesHanded;
    });
    
    this.applySorting(this.filteredCatalogItems);
  }
  private async loadRequiredTypes(): Promise<void> {
    if (this.filters.typeFilter === null) {

      if (!this.isLoadingTypes) {
        this.isLoadingTypes = true;

        this.pendingTypesToLoad = Object.values(EquipmentType)
          .filter(type => typeof type === 'string' && !this.loadedTypes.has(type)) as EquipmentType[];
        
        if (this.pendingTypesToLoad.length > 0) {
          await this.loadNextType();
        } else {
          this.isLoadingTypes = false;
        }
      }
    } else if (!this.loadedTypes.has(this.filters.typeFilter)) {
      this.isLoading = true;
      try {
        await equipmentService.requestLoad(this.filters.typeFilter);

        this.loadedTypes.add(this.filters.typeFilter);

        this.itemCache[this.filters.typeFilter] = 
          await equipmentService.getItemsAsync(this.filters.typeFilter);
      } catch (error) {
        console.error(`Error loading type ${this.filters.typeFilter}:`, error);
      } finally {
        this.isLoading = false;
      }
    }
  }
  
  private async loadNextType(): Promise<void> {
  if (this.pendingTypesToLoad.length === 0) {
    this.isLoadingTypes = false;
    return;
  }
  
  const typeToLoad = this.pendingTypesToLoad.shift();
  if (!typeToLoad) {
    this.isLoadingTypes = false;
    return;
  }
  
  try {
    this.isLoading = true;
    await equipmentService.requestLoad(typeToLoad);
    this.loadedTypes.add(typeToLoad);

    this.itemCache[typeToLoad] = await equipmentService.getItemsAsync(typeToLoad);

    this.lastFilterHash = '';
    
    await this.updateCatalogItems();
    
    this.isLoading = false;
    
    this.loadNextType();
  } catch (error) {
    console.error(`Error loading type ${typeToLoad}:`, error);
    this.isLoading = false;
    this.loadNextType();
  }
}

@Watch("setItems", { deep: true })
onSetItemsChange(newSetItems: BaseItem[]) {
  if (newSetItems.length > 0) {
    this.filters.itemSource = "set";
    this.updateCatalogItems();
    this.filters.typeFilter = null
  }
}

  @Watch("filters.itemSource")
  onItemSourceChange() {
    this.debouncedUpdateFilters();
  }
  
  @Watch("filters.typeFilter")
  async handleTypeChange() {
    this.filters.subtypeFilter = null;
    
    this.lastFilterHash = '';
    
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.updateCatalogItems();
  }
  
  // Watch other filter changes with debounce
  @Watch("filters.subtypeFilter")
  @Watch("filters.rarityFilter")
  @Watch("filters.tierFilter")
  @Watch("filters.levelSort")
  @Watch("filters.socketsSort")
  @Watch("filters.oneHandedFilter")
  onFilterChange() {
    this.debouncedUpdateFilters();
  }

  close() {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    if (this.updateInterval) {
      window.clearInterval(this.updateInterval);
    }
    this.$emit("close");
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.filtersVisible = true;
    }
  }

  activated() {
  if (this.setItems.length > 0) {
    this.filters.itemSource = "set";
    this.updateCatalogItems();
  }
}

  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  }

  unmounted() {
    window.removeEventListener('resize', this.checkMobile);
    
    // Clear any timers
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    if (this.updateInterval) {
      window.clearInterval(this.updateInterval);
    }
  }
}

export { CatalogModal };
export default toNative(CatalogModal);
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-text-primary);
  border-radius: 4px;
}

.catalog-modal {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.catalog-wrapper {
  min-width: 75%;
}

.modal-content {
  max-width: 80%;
  max-height: 75%;
  min-height: 75%;
  min-width: 80%;
  overflow-y: auto;
  display: flex;
  flex-direction: row-reverse;
}

.filter-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: start;
  margin-left: 1rem;
}

.filter-wrapper > *{
  width: 100%;
}

.filters {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  background-color: var(--color-background);
  padding: 2rem;
}

.sockets-button {
  width: 2rem;
  height: 2rem;
}

.one-handed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

select, input[type="text"], input[type="checkbox"] {
  font-size: 1rem;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-button);
  color: var(--color-text-primary);
  max-width: 100%;
}

.catalog-toggle-filters {
  position: fixed;
  top: 0;
  right: 1%;
  z-index: 1001;
  width: 3rem;
  height: 3rem;
  border-radius: 5%;
}

.catalog-toggle-filters button {
  padding: 25%;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .filters {
    position: fixed;
    top: 10%;
    left: 5%;
    min-height: 0;
    z-index: 1005;
    max-width: 90vw;
    background-color: var(--color-background);
    padding: 0;
  }
  .modal-content {
    min-height: 0;
    min-width: 0;
  }

  .catalog-modal {
    min-height: 0;
    max-height: 100vh;
  }
  .filter-wrapper {
    justify-content: space-between;
  }
  .mobile-icon {
    display: inline;
  }

  .catalog-toggle-filters {
    display: inline;
  }
}

@media (min-width: 769px) {
  .desktop-text {
    display: inline;
  }
  .catalog-toggle-filters {
    display: none;
  }
}
</style>