<template>
  <div class="catalog-modal" @click.self="close">
  <div v-if="isMobile" class="catalog-toggle-filters">
    <button @click="toggleFilters">
      <i class="fa-solid fa-filter"></i>
    </button>
  </div>
    <div class="modal-content">
      <div class="filters" v-if="filtersVisible">

        <div class="filter-wrapper">
          <p class="desktop-text">Type:</p>
          <select v-model="typeFilter">
            <option v-for="type in EquipmentType" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Subtype:</p>
          <select v-model="subtypeFilter">
            <option :value="null">all</option>
            <option v-for="subtype in EquipmentSubtypes[typeFilter]" :value="subtype">
              {{ subtype }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Rarity:</p>
          <select v-model="rarityFilter">
            <option :value="null">any</option>
            <option v-for="rarity in EquipmentRarity" :value="rarity">
              {{ rarity }}
            </option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Tier:</p>
          <select v-model="tierFilter">
            <option :value="null">any</option>
            <option v-for="tier in EquipmentTier" :value="tier">
              {{ tier }}
            </option>
          </select>
        </div>

        <div class="filter-wrapper">
          <p class="desktop-text">Level:</p>
          <select v-model="levelSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Sockets:</p>
          <select v-model="socketsSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div class="filter-wrapper" v-if="typeFilter === EquipmentType.Weapon">
            <p class="desktop-text">1-Handed?:</p>
            <select v-model="oneHandedFilter">
              <option value="">any</option>
              <option value="1-Handed">1-Handed</option>
              <option value="2-Handed">2-Handed</option>
            </select>

        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Show Sockets:</p>
          <img class="sockets-button"
            :src="showSockets ? '/img/editor/socket-button-hide.png' : '/img/editor/socket-button-show.png'"
            @click="showSockets = !showSockets" />
        </div>
        <div class="filter-wrapper">
          <p class="desktop-text">Search by Name:</p>
          <input type="text" v-model="nameFilter" placeholder="by Name" />
          </div>
          <div class="filter-wrapper">
          <p class="desktop-text">Search by Stat:</p>
          <input type="text" v-model="statsFilter" placeholder="by Stat" />
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
import { Component, Inject, toNative, Vue, Watch } from "vue-facing-decorator";
import {
  Equipment,
  EquipmentType,
  EquipmentRarity,
  EquipmentTier,
  EquipmentSubtypes,
  WeaponEquipment,
  BaseItem,
} from "../models/Equipment";
import type EditorContext from "../models/EditorContext";
import EquipmentCatalog from "./EquipmentCatalog.vue";
import { equipmentService } from "../service/EquipmentService";

@Component({
  components: {
    EquipmentCatalog,
  },
  emits: ["close"],
})
class CatalogModal extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  public allCatalogItems: BaseItem[] = [];
  private loadedTypes = new Set<string>();
  public isLoading = false;

  public nameFilter: string = "";
  public typeFilter: EquipmentType = EquipmentType.Misc;
  public subtypeFilter: string | null = null;
  public rarityFilter: EquipmentRarity | null = null;
  public tierFilter: EquipmentTier | null = null;
  public statsFilter: string = "";
  public levelSort: "asc" | "desc" | "" = "";
  public socketsSort: "asc" | "desc" | "" = "";
  public filteredCatalogItems: BaseItem[] = [];
  public oneHandedFilter: "1-Handed" | "2-Handed" | "" = "";
  public showSockets = false;

  public isMobile: boolean = false;
  public filtersVisible: boolean = true;

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

  get currentSubtypes(): string[] {
    const items = equipmentService.getItems(this.typeFilter);
    return [...new Set(items.map((i) => i.subtype).filter(Boolean))];
  }

  @Watch("nameFilter")
  @Watch("typeFilter")
  @Watch("subtypeFilter")
  @Watch("rarityFilter")
  @Watch("tierFilter")
  @Watch("statsFilter")
  @Watch("levelSort")
  @Watch("socketsSort")
  @Watch("oneHandedFilter")
  async updateCatalogItems() {
    if (!equipmentService.isInitialized) {
      await equipmentService.initialize();
    }

    const items = equipmentService.getItems(this.typeFilter);

    const nameRegex = new RegExp(this.nameFilter, "i");
    const statsRegex = new RegExp(this.statsFilter, "i");

    const filtered = items.filter((item) => {
      const matchesName = !this.nameFilter || nameRegex.test(item.name);
      const matchesType = item.type === this.typeFilter;
      const matchesSubtype =
        !this.subtypeFilter || item.subtype === this.subtypeFilter;
      const matchesRarity =
        !this.rarityFilter || item.rarity === this.rarityFilter;
      const matchesTier = !this.tierFilter || item.tier === this.tierFilter;
      const matchesStats =
        !this.statsFilter ||
        item.stats.some((stat) => statsRegex.test(stat.raw));
      let matchesHanded = true;
      if (item instanceof WeaponEquipment) {
        const handedType = item.weaponStats.twoHanded ? "2-Handed" : "1-Handed";
        matchesHanded =
          !this.oneHandedFilter || this.oneHandedFilter === handedType;
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

    // Level Sort
    if (this.levelSort) {
      filtered.sort((a, b) => {
        const aLevel = parseInt(a.level) || 0;
        const bLevel = parseInt(b.level) || 0;
        return this.levelSort === "asc" ? aLevel - bLevel : bLevel - aLevel;
      });
    }

    // Socket Sort
    if (this.socketsSort) {
      filtered.sort((a, b) => {
        const aMax = (a as Equipment).sockets?.max || 0;
        const bMax = (b as Equipment).sockets?.max || 0;
        return this.socketsSort === "asc" ? aMax - bMax : bMax - aMax;
      });
    }

    this.filteredCatalogItems = filtered;
  }

  @Watch("typeFilter")
  async handleTypeChange(newType: string) {
    if (!this.loadedTypes.has(newType)) {
      this.isLoading = true;

      const loaded = await equipmentService.loadType(newType as EquipmentType);

      loaded.forEach((item) => {
        this.allCatalogItems.push(item);
      });

      this.loadedTypes.add(newType);
      this.isLoading = false;
    }
    this.updateCatalogItems();
  }

  close() {
    this.$emit("close");
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible 
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;

    if (!this.isMobile) {
      this.filtersVisible = true
    }
  }

  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  }

  unmounted() {
    window.removeEventListener('resize', this.checkMobile);
  }
}

export default toNative(CatalogModal)
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
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
  color: #f0e6d2;
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
