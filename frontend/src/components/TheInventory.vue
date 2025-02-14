<template>
  <div class="the-inventory-container">
    <div class="content-section-1">
      <div class="column-left">
        <EquipmentCatalog :catalogItems="catalogItems" :itemBackgroundSrc="`/img/editor/item-background.png`"
          @item-on-mouse-enter="updateStatDisplay" @item-on-mouse-leave="resetStatDisplay"
          @item-click="onCatalogItemClick" />
      </div>
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
        <CharmGrid :inventory="charmInventory" @inventory-updated="handleCharmInventoryUpdate" 
          @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay"/>
      </div>
    </div>

    <div class="content-section-2">
      <CharmGrid class="inventory" :inventory="charmInventory2" @inventory-updated="handleCharmInventoryUpdate"
       @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay" />

      <div class="buttons">
        <button class="test-button" @click="setupCatalogQuery(EquipmentType.Special, 'Charm')">Filter charm</button>
        <button class="test-button" @click="clearInventory()">Clear Inventory</button>
        <img @click="unlockCharmTopSlot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
        <img @click="unlockCharmBottomSLot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
      </div>
    </div>

    <DraggedSlot v-if="this.context.itemOnCursor" :slotData="this.context.itemOnCursor" ref="draggedSlot" />

    <ItemStatsComponent v-if="lookingAt" :item="lookingAt" :pos="mousePosition" />


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import GameContext from '../models/GameContext';
import CharmGrid from './CharmGrid.vue';
import { Point2D } from '../models/Point2D';
import { Inventory } from '../models/Inventory';
import { CharmEquipment, createEquipment, Equipment, EquipmentType, isValidSubtype } from '../models/Equipment';
import { ItemParser } from '../services/ItemParser';
import DraggedSlot from './DraggedSlot.vue';
// @ts-ignore
import EquipmentCatalog from './EquipmentCatalog.vue';
import { Item } from '../models/Item';
import ItemStatsComponent from './ItemStatsComponent.vue';
import ItemDisplay from './ItemFrame.vue';
import EquipmentSlot from './EquipmentSlot.vue';


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
    CharmGrid,
    EquipmentCatalog,
    DraggedSlot,
    ItemStatsComponent,
    ItemDisplay,
    EquipmentSlot
}})
export default class TheInventory extends Vue {
  @Prop({type: Object, required: true}) context!: GameContext;

  charmInventory!: Inventory;
  charmInventory2!: Inventory;


  created() {
    this.charmInventory = new Inventory(this.context, new Point2D(3, 11));
    this.charmInventory.cellsData.forEach(cell => {
      cell.setCellStyle({height: '2.9rem', width: '2.9rem', border: '8px solid', isEdge: false, background: ''})
    })
    this.charmInventory2 = new Inventory(this.context, new Point2D(11, 5));
    this.charmInventory2.cellsData.forEach(cell => {
      cell.setCellStyle({height: '2.9rem', width: '2.9rem', border: '8px solid', isEdge: false, background: ''})
    })
    this.context.inventories.push(this.charmInventory);
    this.context.inventories.push(this.charmInventory2);
  }

  EquipmentType: any = EquipmentType; 
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

@Watch("subtypeQuery")
watchLookingAt() {
  this.updateCatalogItems()
}

addCharm(charm: CharmEquipment): void {
  this.charmInventory.addItem(new Item(charm, new Point2D(charm.size.width, charm.size.height)))
}

mounted() {
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 3), false)
  this.charmInventory.setIsUnlockedCell(new Point2D(0, 7), false)

  this.charmInventory.setIsUnlockedCell(new Point2D(0, 3), false)
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 7), false)

  this.fetchEquipmentData()
  this.updateCatalogItems()
}

unlockCharmTopSlot() {
  this.charmInventory.setIsUnlockedCell(new Point2D(0, 3), this.topSlotUnlocked)
  this.topSlotUnlocked = !this.topSlotUnlocked
}    


unlockCharmBottomSLot() {
  this.charmInventory.setIsUnlockedCell(new Point2D(2, 7), this.bottomSlotUnlocked)
  this.bottomSlotUnlocked = !this.bottomSlotUnlocked
}

async fetchEquipmentData() {
    try {
      console.log("Started loading catalog");
      
      const response = await fetch('/data/index.json');
      const paths = await response.json();
      
      const itemPromises = paths.map(async (path: string) => {
        try {
          const dataResponse = await fetch(path + '/data.json');
          const jsonData = await dataResponse.json();
          const parsedItem : Equipment = ItemParser.parseWikiItem(jsonData);
          const imageResponse = await fetch(path + '/icon.png');
          if (imageResponse.ok) {
            parsedItem.image = path + '/icon.png';
          }
          
          return parsedItem;
        } catch (error) {
          console.error(`Error loading item from ${path}:`, error);
          return null;
        }
      })
      this.catalogItems = (await Promise.all(itemPromises)).filter(item => item !== null) as Equipment[];
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    } finally {
      console.log("Finished loading catalog", this.catalogItems);
      
    }
  }

  updateCatalogItems() {
    const result = this.catalogItems.filter(item  => {
      const matchesType = !this.typeQuery || item.type.includes(this.typeQuery);
      const matchesSubtype = !this.subtypeQuery ||
        (isValidSubtype(item.type, item.subtype) && item.subtype.includes(this.subtypeQuery));
      return matchesType && matchesSubtype;
    })
    
    this.catalogItems = result
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

onCatalogItemClick(equipment: Equipment) {
  if (equipment instanceof CharmEquipment) {
    this.charmInventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  } else {
    this.charmInventory2.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  }
}

clearInventory() {
  this.charmInventory2.clear()
}


  setupCatalogQuery(_typeQuery: EquipmentType, _subtypeQuery: string) {
    this.typeQuery = _typeQuery
    this.subtypeQuery = _subtypeQuery
 
  }
}
</script>

<style>
.inventory {
  max-width: 40%;
  margin-left: 40rem;
  margin-top: 1rem;
}
.content-section-2 {
  display: flex;
  flex-direction: row;
  justify-content: center;

  max-width: 100%;
}
.content-section-1 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  max-height: 42.9rem;
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
  padding-left: 2rem;
}

.charm-button {
  width: 3rem;
  height: 3rem;
  background-size: contain;
  background-repeat: no-repeat; 
}

</style>