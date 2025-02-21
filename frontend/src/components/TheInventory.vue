<template>
  <div class="the-inventory-container">
    <div class="content-section-1">
      
      <div class="column-right">
        <div class="inventory-container inventory-background">
          <div v-for="slot in slotsConfig" :key="slot.slotName" :class="slot.classes">
            <EquipmentSlotComponent
              :slotName="slot.slotName"
              :equipment="dummyEquipment"
              :cellStyle="slot.style"
              @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay" />
          </div>
        </div>
        <InventoryGrid class="charm-inventory-wrapper" :inventoryName="'charm'"
          @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay"/>
      </div>
    </div>

    <div class="content-section-2">
      <div class="column-left">
        <div class="buttons">
          <img @click="clearInventory" class="test-button charm-button" src="/img/editor/clear-inventory-button.png" />
          <img @click="unlockCharmTopSlot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
          <img @click="unlockCharmBottomSLot" class="test-button charm-button" src="/img/editor/unlock-charm-slot.png" />
        </div>
        </div>
        <div class="column-right">
          <InventoryGrid class="inventory-wrapper" :inventoryName="'main'"
       @slot-mouse-enter="updateStatDisplay" @slot-mouse-leave="resetStatDisplay" />

   
        </div>
    </div>

    <DraggedSlot ref="draggedSlot" />

    <ItemTooltip v-if="lookingAt" :item="lookingAt" :pos="mousePosition" />

    <ArrowButton v-if="!showCatalog" class="arrow-button" @click="showCatalog = true" />
    <keep-alive>
    <CatalogModal 
      v-if="showCatalog"
      :show="showCatalog"
      @close="showCatalog = false"
      @item-on-mouse-enter="updateStatDisplay"
      @item-on-mouse-leave="resetStatDisplay"
      />
    </keep-alive>


  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-facing-decorator';
import EditorContext from '../models/EditorContext';
import InventoryGrid from './InventoryGrid.vue';
import { Point2D } from '../models/Point2D';
import { Inventory } from '../models/Inventory';
import { BaseItem, CharmEquipment, createEquipment, Equipment, EquipmentType } from '../models/Equipment';
import DraggedSlot from './DraggedSlot.vue';
// @ts-ignore
import EquipmentCatalog from './EquipmentCatalog.vue';
import { Item } from '../models/Item';
import ItemTooltip from './ItemTooltip.vue';
import ItemDisplay from './ItemFrame.vue';
import CatalogModal from './CatalogModal.vue';
import ArrowButton from './ArrowButton.vue';
import EquipmentSlotComponent from './EquipmentSlot.vue';
import { EquipmentSlot, type SlotConfig } from '../models/EquipmentSlot';
import { equipmentService } from '../service/EquipmentService';

@Component({
  components: {
    InventoryGrid,
    CatalogModal,
    DraggedSlot,
    ItemTooltip,
    ItemDisplay,
    EquipmentSlotComponent,
    ArrowButton
}})
export default class TheInventory extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;
  public showCatalog = false;
  imageCache = new Map<string, HTMLImageElement>();

  async created() {
    const charmInventoryStyle = {
      height: '2.5rem',
      width: '2.5rem',
      border: '8px solid',
      borderImage: '/img/editor/cell-charm-background.jpg',
      isEdge: false,
      background: ''
    }

    const mainInventoryStyle = {
      height: '2.5rem',
      width: '2.5rem',
      border: '8px solid',
      borderImage: '/img/editor/cell-background.jpg',
      isEdge: false,
      background: ''
    }

    const charmInventory = new Inventory(this.editorContext, new Point2D(3, 11), charmInventoryStyle);
    const mainInventory = new Inventory(this.editorContext, new Point2D(20, 6), mainInventoryStyle);


    this.editorContext.inventories.set('charm', charmInventory);
    this.editorContext.inventories.set('main', mainInventory);


    this.slotsConfig.forEach(config => {
    const slot = new EquipmentSlot(
      createEquipment({ name: '???', level: '???' }),
      config.style,
      config.slotName
    );
    this.editorContext.equipmentSlots.set(config.slotName, slot);
  });

  }
  
  dummyEquipment = createEquipment({ name: '???', level: '???' })

  lookingAt: Equipment | null = null
  mousePosition = { x: 0, y: 0 }
  catalogItems: Equipment[] = [];
  typeQuery: EquipmentType = EquipmentType.Special
  subtypeQuery: string = 'Glyph'
  topSlotUnlocked = false
  bottomSlotUnlocked = false

  get slotsConfig(): SlotConfig[] {
    return EquipmentSlot.getslotsConfig();
  }

mounted() {
  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(2, 3), false)
  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(0, 7), false)

  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(0, 3), false)
  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(2, 7), false)
}

unlockCharmTopSlot() {
  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(0, 3), this.topSlotUnlocked);
  this.topSlotUnlocked = !this.topSlotUnlocked
}    


unlockCharmBottomSLot() {
  this.editorContext.charmInventory.setIsUnlockedCell(new Point2D(2, 7), this.bottomSlotUnlocked)
  this.bottomSlotUnlocked = !this.bottomSlotUnlocked
}




updateStatDisplay(data: { equipment: Equipment; pos: { x: number; y: number } }): void {
  this.lookingAt = data.equipment;
  this.mousePosition = data.pos;
}

resetStatDisplay(): void  {
  this.lookingAt = null
}


onCatalogItemClick(equipment: Equipment) {
  if (equipment instanceof CharmEquipment) {
    this.editorContext.charmInventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  } else {
    this.editorContext.mainInventory.addItem(new Item(equipment, new Point2D(equipment.size.width, equipment.size.height)))
  }
}

clearInventory() {
  this.editorContext.mainInventory.clear()
}
}
</script>

<style>
.catalog-wrapper {
  max-height: 42.9rem;
}
.charm-inventory-wrapper {
  padding-right: 1rem
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
  justify-content: center;
  align-items: center;
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