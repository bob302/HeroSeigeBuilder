<template>
  <div v-if="show" class="catalog-modal">
    <div class="modal-content">
      <div class="filters">
        <div class="filter-column">
          <p>Type:</p>
          <select v-model="typeFilter">
            <option v-for="type in EquipmentType" :value="type">{{ type }}</option>
          </select>
          <p>Subtype:</p>
          <select v-model="subtypeFilter">
            <option :value="null">all</option>
            <option v-for="subtype in EquipmentSubtypes[typeFilter]" :value="subtype">{{ subtype }}</option>
          </select>
        </div>
        <div class="filter-column">
          <p>Rarity:</p>
          <select v-model="rarityFilter">
            <option :value="null">any</option>
            <option v-for="rarity in EquipmentRarity" :value="rarity">{{ rarity }}</option>
          </select>
          <p>Tier:</p>
          <select v-model="tierFilter">
            <option :value="null">any</option>
            <option v-for="tier in EquipmentTier" :value="tier">{{ tier }}</option>
          </select>
        </div>
        <div class="filter-column">
          <p>Level:</p>
          <select v-model="levelSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <p>Sockets:</p>
          <select v-model="socketsSort">
            <option value="">any</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="filter-column">
          <p>Search by Name:</p>
          <input v-model="nameFilter" placeholder="by Name" />
          <p>Search by Stat Name:</p>
          <input v-model="statsFilter" placeholder="by Stat" />
        </div>
      </div>

      <div class="catalog-wrapper">
        <EquipmentCatalog :catalogItems="filteredCatalogItems" :itemBackgroundSrc="`/img/editor/item-background.png`"
        @item-click="handleItemClick" @item-on-mouse-enter="(e: any) => $emit('item-on-mouse-enter', e)"
        @item-on-mouse-leave="(e: any) => $emit('item-on-mouse-leave', e)" />
      </div>
    </div>
    <ArrowButton @click="close"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import { Inventory } from '../models/Inventory';
import { Equipment, EquipmentType, EquipmentRarity, EquipmentTier, EquipmentSubtypes, CharmEquipment } from '../models/Equipment';
import type GameContext from '../models/GameContext';
import { Item } from '../models/Item';
import { Point2D } from '../models/Point2D';
import { ItemParser } from '../services/ItemParser';
import EquipmentCatalog from './EquipmentCatalog.vue';
import ArrowButton from './ArrowButton.vue';

@Component({
  components: {
    EquipmentCatalog,
    ArrowButton
  }
})
export default class CatalogModal extends Vue {
  @Prop({ type: Boolean, default: false }) show!: boolean;
  @Prop({ type: Object, required: true }) context!: GameContext;
  @Prop({ type: Object, required: true }) charmInventory!: Inventory;
  @Prop({ type: Object, required: true }) mainInventory!: Inventory;
  @Prop({ type: Array, required: true }) allCatalogItems!: Equipment[];


  // Реактивные свойства фильтров
  public nameFilter: string = '';
  public typeFilter: EquipmentType = EquipmentType.Weapon;
  public subtypeFilter: string | null = null;
  public rarityFilter: EquipmentRarity | null = null;
  public tierFilter: EquipmentTier | null = null;
  public statsFilter: string = '';
  public levelSort: 'asc' | 'desc' | '' = '';
  public socketsSort: 'asc' | 'desc' | '' = '';
  public filteredCatalogItems: Equipment[] = [];

  mounted() {
     this.updateCatalogItems()
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

  // Методы фильтрации и сортировки...
  
  handleItemClick(equipment: Equipment) {
    const targetInventory = equipment instanceof CharmEquipment 
      ? this.charmInventory 
      : this.mainInventory;
    
    targetInventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)));
    this.$emit('item-added');
  }

  @Watch('nameFilter')
  @Watch('typeFilter')
  @Watch('subtypeFilter')
  @Watch('rarityFilter')
  @Watch('tierFilter')
  @Watch('statsFilter')
  @Watch('levelSort')
  @Watch('socketsSort')
  updateCatalogItems() {
    const nameRegex = new RegExp(this.nameFilter, 'i');
    const statsRegex = new RegExp(this.statsFilter, 'i');

    let filtered = this.allCatalogItems.filter(item => {
      const matchesName = !this.nameFilter || nameRegex.test(item.name);
      const matchesType = item.type === this.typeFilter;
      const matchesSubtype = !this.subtypeFilter || item.subtype === this.subtypeFilter;
      const matchesRarity = !this.rarityFilter || item.rarity === this.rarityFilter;
      const matchesTier = !this.tierFilter || item.tier === this.tierFilter;
      const matchesStats = !this.statsFilter || item.stats.some(stat => statsRegex.test(stat.raw));

      return matchesName && matchesType && matchesSubtype && matchesRarity && matchesTier && matchesStats;
    });
    // Сортировка по уровню
    if (this.levelSort) {
      filtered.sort((a, b) => {
        const aLevel = parseInt(a.level) || 0;
        const bLevel = parseInt(b.level) || 0;
        return this.levelSort === 'asc' ? aLevel - bLevel : bLevel - aLevel;
      });
    }

    // Сортировка по сокетам
    if (this.socketsSort) {
      filtered.sort((a, b) => {
        const aMax = a.sockets?.max || 0;
        const bMax = b.sockets?.max || 0;
        return this.socketsSort === 'asc' ? aMax - bMax : bMax - aMax;
      });
    }

    this.filteredCatalogItems = filtered;
  }

  @Watch('typeFilter')
  onTypeFilterChanged(newType: EquipmentType) {
    const validSubtypes = EquipmentSubtypes[newType];
    if (this.subtypeFilter && !validSubtypes.includes(this.subtypeFilter)) {
      this.subtypeFilter = null;
    }
    this.updateCatalogItems();
  }

  close() {
    this.$emit('close');
  }

  // Остальная логика фильтрации...
}
</script>

<style scoped>
.catalog-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-height: 40rem;
  overflow-y: auto;
}

.filter-column > * {
  width: 90%;
  padding-right: 2rem;
}

.filters {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  height: 10rem;
  padding-bottom: 2rem;
}

</style>