<template>
  <div class="the-inventory-container">
    <div class="content-section-1">
      
      <div class="column-right">
        <div class="inventory-container inventory-background">
          <div v-for="slot in slotsConfig" :key="slot.slotName" :class="slot.classes">
            <EquipmentSlot
              :background="slot.image"
              :context="context" 
              :equipment="dummyEquipment"
              :cellStyle="slot.style"
              @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay" />
          </div>
        </div>
        <InventoryGrid :inventory="charmInventory" @inventory-updated="handleCharmInventoryUpdate" 
          @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay"/>
        <div class="buttons">
          <img @click="clearInventory" class="test-button charm-button" src="/img/editor/clear-inventory-button.png" />
          <img @click="unlockCharmTopSlot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
          <img @click="unlockCharmBottomSLot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
        </div>
        
      </div>
    </div>

    <div class="content-section-2">
      <div class="column-left">
        
        </div>
        <div class="column-right">
          <InventoryGrid class="inventory-wrapper" :inventory="inventory" @inventory-updated="handleCharmInventoryUpdate"
       @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay" />

   
        </div>
    </div>

    <DraggedSlot v-if="this.context.itemOnCursor" :slotData="this.context.itemOnCursor" ref="draggedSlot" />

    <ItemStatsComponent v-if="lookingAt && !showCatalog" :item="lookingAt" :pos="mousePosition" />

    <ArrowButton v-if="!showCatalog" class="arrow-button" @click="showCatalog = true" />
    <keep-alive>
    <CatalogModal 
      v-if="showCatalog"
      :show="showCatalog"
      :context="context"
      :charm-inventory="charmInventory"
      :main-inventory="inventory"
      :allCatalogItems="allCatalogItems"
      @close="showCatalog = false"
      @item-on-mouse-enter="updateStatDisplay"
      @item-on-mouse-leave="resetStatDisplay"
      />
    </keep-alive>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import GameContext from '../models/GameContext';
import InventoryGrid from './InventoryGrid.vue';
import { Point2D } from '../models/Point2D';
import { Inventory } from '../models/Inventory';
import { CharmEquipment, createEquipment, Equipment, EquipmentRarity, EquipmentSubtypes, EquipmentTier, EquipmentType, isValidSubtype } from '../models/Equipment';
import { ItemParser } from '../services/ItemParser';
import DraggedSlot from './DraggedSlot.vue';
// @ts-ignore
import EquipmentCatalog from './EquipmentCatalog.vue';
import { Item } from '../models/Item';
import ItemStatsComponent from './ItemStatsComponent.vue';
import ItemDisplay from './ItemFrame.vue';
import EquipmentSlot from './EquipmentSlot.vue';
import CatalogModal from './CatalogModal.vue';
import ArrowButton from './ArrowButton.vue';


interface SlotConfig {
  classes: string[],
  slotName: keyof Slots;
  hasItem: boolean;
  hasClick: boolean;
  image: string
  style: {width: string, height: string, border: string, isEdge: boolean}
}

interface Slots {
  [key: string]: Equipment
}

@Component({
  components: {
    InventoryGrid,
    CatalogModal,
    DraggedSlot,
    ItemStatsComponent,
    ItemDisplay,
    EquipmentSlot,
    ArrowButton
}})
export default class TheInventory extends Vue {
  @Prop({type: Object, required: true}) context!: GameContext;

  charmInventory!: Inventory;
  inventory!: Inventory;
  public showCatalog = false;
  public allCatalogItems: Equipment[] = [];
  imageCache = new Map<string, HTMLImageElement>();


async created() {
    this.charmInventory = new Inventory(this.context, new Point2D(3, 11));
    this.charmInventory.cellsData.forEach(cell => {
      cell.setCellStyle({height: '2.9rem', width: '2.9rem', border: '8px solid', isEdge: false, borderImage: '/img/editor/cell-charm-background.jpg', background: ''})
    })
    this.inventory = new Inventory(this.context, new Point2D(20, 5));
    this.inventory.cellsData.forEach(cell => {
      cell.setCellStyle({height: '2.9rem', width: '2.9rem', border: '8px solid', isEdge: false, borderImage: '/img/editor/cell-background.jpg', background: ''})
    })
    this.context.inventories.push(this.charmInventory);
    this.context.inventories.push(this.inventory);

    await this.fetchEquipmentData();
  }

  dummyEquipment = createEquipment({ name: '???', level: '???' })



  slotsConfig: SlotConfig[] = [
  { classes: ['slot-item', 'helm'], slotName: 'helm', hasItem: true, hasClick: true, image: '/img/editor/slot-helm.JPEG', 
    style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false} }, 
  { classes: ['slot-item', 'amulet'], slotName: 'amulet', hasItem: true, hasClick: true, image: '/img/editor/slot-amulet.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'weapon'], slotName: 'weapon', hasItem: true, hasClick: true, image: '/img/editor/slot-weapon.JPEG', 
    style: {width: '10rem', height: '15rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'body-armour'],  slotName: 'bodyArmour', hasItem: true, hasClick: true, image: '/img/editor/slot-body.JPEG', 
    style: {width: '6.7rem', height: '11.3rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'offhand'],  slotName: 'offhand', hasItem: true, hasClick: true, image: '/img/editor/slot-offhand.JPEG', 
    style: {width: '10rem', height: '15rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'ring'],  slotName: 'ringLeft', hasItem: true, hasClick: true, image: '/img/editor/slot-ring.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'belt'],  slotName: 'belt', hasItem: true, hasClick: true, image: '/img/editor/slot-belt.JPEG', 
    style: {width: '6.7rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'ring2'], slotName: 'ringRight', hasItem: true, hasClick: true, image: '/img/editor/slot-ring.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'gloves'],  slotName: 'gloves', hasItem: true, hasClick: true, image: '/img/editor/slot-gloves.JPEG', 
    style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'boots'], slotName: 'boots', hasItem: true, hasClick: true, image: '/img/editor/slot-boots.JPEG', 
    style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'flask', 'flask1'], slotName: 'flask1', hasItem: true, hasClick: true, image: '/img/editor/slot-flask.JPEG', 
    style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'flask', 'flask2'], slotName: 'flask2', hasItem: true, hasClick: true, image: '/img/editor/slot-flask.JPEG', 
    style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'flask', 'flask3'], slotName: 'flask3', hasItem: true, hasClick: true, image: '/img/editor/slot-flask.JPEG', 
    style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'flask', 'flask4'], slotName: 'flask4', hasItem: true, hasClick: true, image: '/img/editor/slot-flask.JPEG', 
    style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'relic', 'relic1'],  slotName: 'relic1', hasItem: true, hasClick: true, image: '/img/editor/slot-relic.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'relic', 'relic2'],  slotName: 'relic2', hasItem: true, hasClick: true, image: '/img/editor/slot-relic.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'relic', 'relic3'],  slotName: 'relic3', hasItem: true, hasClick: true, image: '/img/editor/slot-relic.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'relic', 'relic4'],  slotName: 'relic4', hasItem: true, hasClick: true, image: '/img/editor/slot-relic.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
  { classes: ['slot-item', 'relic', 'relic5'],  slotName: 'relic5', hasItem: true, hasClick: true, image: '/img/editor/slot-relic.JPEG', 
    style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false} },
]

slots: { [key: string]: Equipment } = {
  helm: createEquipment({ name: '???', level: '???' }),
  amulet: createEquipment({ name: '???', level: '???' }),
  weapon: createEquipment({ name: '???', level: '???' }),
  bodyArmour: createEquipment({ name: '???', level: '???' }),
  offhand: createEquipment({ name: '???', level: '???' }),
  ringLeft: createEquipment({ name: '???', level: '???' }),
  ringRight: createEquipment({ name: '???', level: '???' }),
  belt: createEquipment({ name: '???', level: '???' }),
  gloves: createEquipment({ name: '???', level: '???' }),
  boots: createEquipment({ name: '???', level: '???' }),
  flask1: createEquipment({ name: '???', level: '???' }),
  flask2: createEquipment({ name: '???', level: '???' }),
  flask3: createEquipment({ name: '???', level: '???' }),
  flask4: createEquipment({ name: '???', level: '???' }),
  relic1: createEquipment({ name: '???', level: '???' }),
  relic2: createEquipment({ name: '???', level: '???' }),
  relic3: createEquipment({ name: '???', level: '???' }),
  relic4: createEquipment({ name: '???', level: '???' }),
  relic5: createEquipment({ name: '???', level: '???' }),
}

lookingAt: Equipment | null = null
mousePosition = { x: 0, y: 0 }
catalogItems: Equipment[] = [];
typeQuery: EquipmentType = EquipmentType.Special
subtypeQuery: string = 'Glyph'
topSlotUnlocked = false
bottomSlotUnlocked = false


addCharm(charm: CharmEquipment): void {
  this.charmInventory.addItem(new Item(charm, new Point2D(charm.size.width, charm.size.height)))
}

mounted() {
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 3), false)
  this.charmInventory.setIsUnlockedCell(new Point2D(0, 7), false)

  this.charmInventory.setIsUnlockedCell(new Point2D(0, 3), false)
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 7), false)
}

unlockCharmTopSlot() {
  this.charmInventory.setIsUnlockedCell(new Point2D(0, 3), this.topSlotUnlocked)
  this.topSlotUnlocked = !this.topSlotUnlocked
}    


unlockCharmBottomSLot() {
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 7), this.bottomSlotUnlocked)
  this.bottomSlotUnlocked = !this.bottomSlotUnlocked
}




updateStatDisplay(data: { equipment: Equipment; pos: { x: number; y: number } }): void {
  this.lookingAt = data.equipment;
  this.mousePosition = data.pos;
}

resetStatDisplay(): void  {
  this.lookingAt = null
}

handleCharmInventoryUpdate(newInventory: Inventory): void {
  this.charmInventory = newInventory;
}

async parseSlotItem (slot: keyof Slots) {
  const input = prompt(`Введите JSON для ${slot}`, '');
  if (!input) return;
  try {
    const parsedItem = await ItemParser.parseItem(JSON.parse(input));
    this.slots[slot] = parsedItem;
  } catch (error) {
    console.error(`Ошибка парсинга для ${slot}:`, error);
  } finally {
    this.slots[slot].isLoading = false;
  }
}

async fetchEquipmentData() {
  const loadImage = (url: string) => new Promise((resolve, reject) => {
    if (this.imageCache.has(url)) {
      resolve(this.imageCache.get(url));
      return;
    }

    const img = new Image();
    img.src = url;
    
    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${url}`));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      this.imageCache.set(url, img);
      resolve(img);
    };
    
    img.onerror = (err) => {
      clearTimeout(timeout);
      reject(err);
    };
  });

  try {
    const response = await fetch('/data/index.json');
    const paths = await response.json();
    
    const itemPromises = paths.map(async (path: string) => {
      try {
        const dataResponse = await fetch(path + '/data.json');
        if (!dataResponse.ok) throw new Error('Data load failed');
        
        const jsonData = await dataResponse.json();
        const parsedItem = ItemParser.parseWikiItem(jsonData);
        
        try {
          const imageUrl = path + '/icon.png';
          await loadImage(imageUrl);
          parsedItem.image = imageUrl;
        } catch (imgError) {
          console.warn('Image load failed:', imageUrl);
          parsedItem.image = '/img/fallback-icon.png';
        }
        
        return parsedItem;
      } catch (error) {
        console.error(`Error loading item from ${path}:`, error);
        return null;
      }
    });

    this.allCatalogItems = (await Promise.all(itemPromises))
      .filter(item => item !== null) as Equipment[];
  } catch (error) {
    console.error('Catalog load failed:', error);
  }
}

onCatalogItemClick(equipment: Equipment) {
  if (equipment instanceof CharmEquipment) {
    this.charmInventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  } else {
    this.inventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  }
}

clearInventory() {
  this.inventory.clear()
}


setupCatalogQuery(_typeQuery: EquipmentType, _subtypeQuery: string) {
  this.typeQuery = _typeQuery
  this.subtypeQuery = _subtypeQuery

}
}
</script>

<style>
.catalog-wrapper {
  max-height: 42.9rem;
}

.inventory-wrapper {
  max-height: 19rem;
}
.column-left {
  display: flex;
  flex-direction: column;
}


.column-left {
  display: flex;
  flex-direction: row;
}
.content-section-2 {
  display: flex;
  flex-direction: row;
  justify-content: center;

  width: 100%;
  padding-top: 1rem;
}
.content-section-1 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  max-height: 42.9rem;
  background-color: #0c090c;
}
.column-right {
  display: flex;
  flex-direction: row;
}
.inventory-container {
  display: grid;
  grid-template-columns: repeat(8, 1rem);
  grid-template-rows: repeat(8, 1rem);
  grid-template-areas:
        ". . . . helm helm amulet . ."
        ". . . . helm helm amulet . ."
        "relic1 weapon weapon weapon body-armour body-armour offhand offhand offhand"
        "relic2 weapon weapon weapon body-armour body-armour offhand offhand offhand"
        "relic3 weapon weapon weapon body-armour body-armour offhand offhand offhand"
        "relic4 weapon weapon weapon body-armour body-armour offhand offhand offhand"
        "relic5 . . ring belt belt ring2 . ."
        ". gloves gloves flask1 flask2 flask3 flask4 boots boots"
        ". gloves gloves flask1 flask2 flask3 flask4 boots boots"
        ". . . . . . . . ."
        ". . . . . . . . ."
        ". . . . . . . . .";
    gap: 3.5rem;
    justify-items: anchor-center;
    align-items: anchor-center;
    z-index: 15;
}

.inventory-background {
  background-image: url('/img/editor/inventory-background.png');
  background-size: contain;
  background-repeat: no-repeat;
}

.the-inventory-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.helm {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: helm;
  margin-left: 3.5rem;
  margin-top: 7.6rem;
}
.amulet {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: amulet;
  margin-left: 3.5rem;
  margin-top: 4.5rem;
}
.weapon {
  width: 10rem;
  height: 15rem;
  grid-area: weapon;
  margin-left: 4.9rem;
  margin-top: 3.5rem;
}
.body-armour {
  width: 6.7rem;
  height: 11.3rem;
  grid-area: body-armour;
  margin-left: 3.3rem;
  margin-top: 4.8rem;
}
.offhand {
  width: 10rem;
  height: 15rem;
  grid-area: offhand;
  margin-right: 2.5rem;
  margin-top: 3.5rem;

}
.ring {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: ring;
  margin-left: 2.5rem;
  margin-top: 2.5rem;


}
.belt {
  width: 6.7rem;
  height: 3.84rem;
  grid-area: belt;
  margin-left: 3rem;
  margin-top: 2.5rem;

}

.ring2 {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: ring2;
  margin-left: 4rem;
  margin-top: 2.5rem;

}
.gloves {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: gloves;
  margin-left: 3.5rem;
}

.flask1 { grid-area: flask1; }
.flask2 { grid-area: flask2; }
.flask3 { grid-area: flask3; }
.flask4 { grid-area: flask4; }

.relic1 { grid-area: relic1; }
.relic2 { grid-area: relic2; }
.relic3 { grid-area: relic3; }
.relic4 { grid-area: relic4; }
.relic5 { grid-area: relic5; }

.flask {
  width: 3.2rem;
  height: 7.2rem;
  margin-left: 2.5rem;
  margin-top: 0.4rem;

}

.relic {
  width: 3.52rem;
  height: 3.84rem;
  margin-left: 7rem;
  margin-top: 2rem;
}

.charm {
  width: 3.52rem;
  height: 3.52rem;
}

.boots {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: boots;
  margin-right: 3rem;
}

.test-button {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  flex-direction: column;
}

.charm-button {
  width: 3rem;
  height: 3rem;
  background-size: contain;
  background-repeat: no-repeat; 
}
.arrow-button {
  scale: -1;
  position: fixed;
  z-index: 100;
  top: 48%;
  left: 95%;
}
</style>