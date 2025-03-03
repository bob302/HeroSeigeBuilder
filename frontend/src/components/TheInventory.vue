<template>
  <div class="the-inventory-container">
    <div class="content-section-1">
      <InventoryGrid class="inventory-wrapper" :inventoryName="'main'" />

      <div class="equipment-wrapper" :style="equipmentStyle">
        <div v-for="slot in slotsConfig" :key="slot.slotName" :class="slot.classes">
          <EquipmentSlotComponent :slotName="slot.slotName" :equipment="dummyEquipment" :cellStyle="slot.style" />
        </div>
      </div>

      <InventoryGrid class="charm-inventory-wrapper" :inventoryName="'charm'" />

    </div>
  </div>

  <div class="content-section-2">
    <div class="column-left">
      <div class="column-right"></div>
    </div>

    <DraggedSlot ref="draggedSlot" />
  </div>
</template>

<script lang="ts">
import { Component, Inject, toNative, Vue } from "vue-facing-decorator";
import EditorContext from "../models/EditorContext";
import InventoryGrid from "./InventoryGrid.vue";
import { Point2D } from "../models/Point2D";
import { Inventory } from "../models/Inventory";
import {
  CharmEquipment,
  createEquipment,
  Equipment,
} from "../models/Equipment";
import DraggedSlot from "./DraggedSlot.vue";
// @ts-ignore
import EquipmentCatalog from "./EquipmentCatalog.vue";
import { Item } from "../models/Item";
import CatalogModal from "./CatalogModal.vue";
import EquipmentSlotComponent from "./EquipmentSlot.vue";
import { EquipmentSlot, type SlotConfig } from "../models/EquipmentSlot";
import ItemDisplay from "./CatalogItem.vue";
import { computed, type CSSProperties } from "vue";

@Component({
  components: {
    InventoryGrid,
    CatalogModal,
    DraggedSlot,
    ItemDisplay,
    EquipmentSlotComponent,
  },
})
class TheInventory extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  imageCache = new Map<string, HTMLImageElement>();

  async created() {

    const charmInventory = new Inventory(
      this.editorContext,
      'charm'
    );

    const mainInventory = new Inventory(
      this.editorContext,
      'main'
    );

    charmInventory.needToBeSerialized = true

    this.editorContext.inventories.set("charm", charmInventory);
    this.editorContext.inventories.set("main", mainInventory);

    this.slotsConfig.forEach((config) => {
      const slot = new EquipmentSlot(
        createEquipment({ name: "???", level: "???" }),
        config.style,
        config.slotName,
      );
      if (config.restrictions && config.restrictions?.size > 0) {
        slot.setRestrictions(config.restrictions)
      }
      this.editorContext.equipmentSlots.set(config.slotName, slot);
    });
  }

  dummyEquipment = createEquipment({ name: "???", level: "???" });

  get slotsConfig(): SlotConfig[] {
    return EquipmentSlot.getslotsConfig();
  }
  
  mounted() {
    this.editorContext.charmInventory.setIsUnlockedCell(
      new Point2D(2, 3),
      false,
    );
    this.editorContext.charmInventory.setIsUnlockedCell(
      new Point2D(0, 7),
      false,
    );

    this.editorContext.charmInventory.setIsUnlockedCell(
      new Point2D(0, 3),
      false,
    );
    this.editorContext.charmInventory.setIsUnlockedCell(
      new Point2D(2, 7),
      false,
    );
  }

  get equipmentStyle(): CSSProperties {
    const scaleFactor = this.editorContext.getScaleFactor()

    return {
      display: "grid",
      rowGap: `${5 * scaleFactor}rcap`,
      columnGap: `${5 * scaleFactor}rcap`,
      maxWidth: `${scaleFactor === 0.75 ? 100 : 100 * scaleFactor}%`,
      maxHeight: `${scaleFactor === 0.75 ? 100 : 100 * scaleFactor}%`,
    };
  }


  onCatalogItemClick(equipment: Equipment) {
    if (equipment instanceof CharmEquipment) {
      this.editorContext.charmInventory.addItem(
        new Item(
          equipment,
          new Point2D(equipment.size.width, equipment.size.height),
        ),
      );
    } else {
      this.editorContext.mainInventory.addItem(
        new Item(
          equipment,
          new Point2D(equipment.size.width, equipment.size.height),
        ),
      );
    }
  }
}

export default toNative(TheInventory)
</script>

<style>
.charm-inventory-wrapper {
  background-color: var(--color-background);
}
.column-left {
  display: flex;
  flex-direction: column;
}

.content-section-2 {
  display: flex;
  flex-direction: row;
  justify-content: center;

  width: 100%;
  padding-top: 1rem;
}

.content-section-1 {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background-color: var(--color-background);
}

.column-right {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.equipment-wrapper {
  background-color: var(--color-background);
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
  justify-items: center;
  align-items: center;
  z-index: 15;
  margin: 0 4vw 0 4vw;
}

.the-inventory-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.helm {
  width: calc(6.7 * var(--scale-factor));
  height: calc(6.7 * var(--scale-factor));
  grid-area: helm;
}
.amulet {
  width: calc(3.52 * var(--scale-factor));
  height: calc(3.84 * var(--scale-factor));
  grid-area: amulet;
}
.weapon {
  width: calc(10 * var(--scale-factor));
  height: calc(15 * var(--scale-factor));
  grid-area: weapon;
}
.body-armour {
  width: calc(6.7 * var(--scale-factor));
  height: calc(11.3 * var(--scale-factor));
  grid-area: body-armour;
}
.offhand {
  width: calc(10 * var(--scale-factor));
  height: calc(15 * var(--scale-factor));
  grid-area: offhand;
}
.ring {
  width: calc(3.52 * var(--scale-factor));
  height: calc(3.84 * var(--scale-factor));
  grid-area: ring;
}
.belt {
  width: calc(6.7 * var(--scale-factor));
  height: calc(3.84 * var(--scale-factor));
  grid-area: belt;
}
.ring2 {
  width: calc(3.52 * var(--scale-factor));
  height: calc(3.84 * var(--scale-factor));
  grid-area: ring2;
}
.gloves {
  width: calc(6.7 * var(--scale-factor));
  height: calc(6.7 * var(--scale-factor));
  grid-area: gloves;
}
.flask {
  width: calc(3.2 * var(--scale-factor));
  height: calc(7.2 * var(--scale-factor));
}
.relic {
  width: calc(3.52 * var(--scale-factor));
  height: calc(3.84 * var(--scale-factor));
}
.charm {
  width: calc(3.52 * var(--scale-factor));
  height: calc(3.52 * var(--scale-factor));
}
.boots {
  width: calc(6.7 * var(--scale-factor));
  height: calc(6.7 * var(--scale-factor));
  grid-area: boots;
}

.flask1 {
  grid-area: flask1;
}
.flask2 {
  grid-area: flask2;
}
.flask3 {
  grid-area: flask3;
}
.flask4 {
  grid-area: flask4;
}

.relic1 {
  grid-area: relic1;
}
.relic2 {
  grid-area: relic2;
}
.relic3 {
  grid-area: relic3;
}
.relic4 {
  grid-area: relic4;
}
.relic5 {
  grid-area: relic5;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1rem;
}

.buttons > * {
  border: none;
  cursor: pointer;
  background: var(--color-button);
  height: 2rem;
}

@media (max-width: 768px) {
  .equipment-wrapper {
    grid-template-rows: auto;
    grid-template-columns: repeat(6, 1rem);
    grid-template-areas:
      " weapon weapon weapon offhand offhand offhand"
      " weapon weapon weapon offhand offhand offhand"
      " weapon weapon weapon offhand offhand offhand"
      " weapon weapon weapon offhand offhand offhand"
      " body-armour body-armour ring belt belt ring2"
      " body-armour body-armour flask1 flask2 flask3 flask4"
      " body-armour body-armour flask1 flask2 flask3 flask4"
      " helm helm gloves gloves boots boots"
      " helm helm gloves gloves boots boots"
      "relic1 relic2 relic3 relic4 relic5 amulet";
    align-content: center;

    order: 1;
  }

  .equipment-wrapper > * {
    margin: 0;
  }

  .inventory-background {
    background-image: none;
    background-color: #0c090c;
  }

  .content-section-1 {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5vh;
  }

  .inventory-wrapper {
    order: 2;
  }

  .charm-inventory-wrapper {
    order: 3;
  }
}
</style>
