<template>
  <div class="container">
    <div class="inventory-container">
      <div class="helm">HELM</div>
      <div class="amulet">AMULET</div>
      <div class="weapon">HAND 1</div>
      <div class="body-armour">BODY</div>
      <div class="offhand">HAND 2</div>
      <div class="ring">RING 1</div>
      <div class="belt">BELT</div>
      <div class="ring2">RING 2</div>
      <div class="gloves">GLOVES</div>
      <div class="flask flask1">FLASK 1</div>
      <div class="flask flask2">FLASK 2</div>
      <div class="flask flask3">FLASK 3</div>
      <div class="flask flask4">FLASK 4</div>
      <div class="boots">BOOTS</div>
      <div class="relic relic1">RELIC</div>
      <div class="relic relic2">RELIC</div>
      <div class="relic relic3">RELIC</div>
      <div class="relic relic4">RELIC</div>
      <div class="relic relic5">RELIC</div>
    </div>
    <div class="charms">
      <div class="grid-wrapper">
        <GridComponent :inventory="testInventory" @inventory-updated="handleInventoryUpdate" />
      </div>
      <button @click="addAnvil" class="test-button">Anvil</button>
      <button @click="addFulgirite" class="test-button">Fulgurite</button>
      <button @click="addMelon" class="test-button">Melon</button>
      <button @click="findAllItemsInAllCells" class="test-button">Find</button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { Inventory, type ItemConstructor } from '../models/Inventory';
import GridComponent from '../components/GridComponent.vue';
import { Equipment, EquipmentRarity, EquipmentTier, EquipmentType } from '../models/Equipment';
import { Point2D } from '../models/Point2D';
import { Item } from '../models/Item';

const testInventory: Ref<Inventory> = ref(new Inventory(new Point2D(3, 11), 44));

  // debug
  const findAllItemsInAllCells = () => {
    const size = testInventory.value.gridSize

    for (let i = 0; i < size.x; i++) {
      for (let j = 0; j < size.y; j++) {
        const item = testInventory.value.getItemInCell(new Point2D(i, j))
        console.log(item);
      }
    }
  }

const handleInventoryUpdate = (newInventory: Inventory): void => {
  testInventory.value = newInventory;
}

const addAnvil = () => {
  if (testInventory.value.itemOnCursor) return
  testInventory.value.addItem( new Item(test3.value, new Point2D(1, 1)), testInventory.value.cellSize)
}

const addMelon = () => {
  if (testInventory.value.itemOnCursor) return
  testInventory.value.addItem( new Item(test2.value, new Point2D(2, 2)), testInventory.value.cellSize)

}
const addFulgirite = () => {
  if (testInventory.value.itemOnCursor) return
  testInventory.value.addItem( new Item(test.value, new Point2D(1, 2)), testInventory.value.cellSize)
}


const testSrc = '/data/charms/fulgurite/icon.png'
const testSrc2 = '/data/charms/water-melon/icon.png'
const testSrc3 = '/data/charms/torsteins-anvil/icon.png'

const test3 = ref<Equipment>({
  name: 'Generic Item',
  type: EquipmentType.Special,
  subtype: 'Charm',
  tier: EquipmentTier.S,
  level: '100',
  stats: [],
  sockets: { amount: 0, min: 0, max: 0, list: [] },
  rarity: EquipmentRarity.Heroic,
  isLoading: false,
  image: testSrc3
})

const test2 = ref<Equipment>({
  name: 'Generic Item',
  type: EquipmentType.Special,
  subtype: 'Charm',
  tier: EquipmentTier.S,
  level: '100',
  stats: [],
  sockets: { amount: 0, min: 0, max: 0, list: [] },
  rarity: EquipmentRarity.Angelic,
  isLoading: false,
  image: testSrc2
})

const test = ref<Equipment>({
  name: 'Generic Item',
  type: EquipmentType.Special,
  subtype: 'Charm',
  tier: EquipmentTier.S,
  level: '100',
  stats: [],
  sockets: { amount: 0, min: 0, max: 0, list: [] },
  rarity: EquipmentRarity.Heroic,
  isLoading: false,
  image: testSrc
})

onMounted(() => {
  // debug
  console.log("Test Inventory:", testInventory);
});

</script>

<style scoped>
.container {
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
        ". gloves gloves flask1 flask2 flask3 flask4 boots boots";
    gap: 3.5rem;
    justify-items: center;
    align-items: center;
}

.charms-container {
  display: grid;
  grid-template-columns: repeat(3, 3rem);
  grid-template-rows: repeat(11, 3rem);
  gap: 2px;
  background: #222;
  padding: 5px;
  border: 2px solid #555;
  width: fit-content;
  border: 1px solid red;
}

.c1x1 { background: #8c49e2; }
.c1x2 { background: #1a8ffc; }
.c1x3 { background: #1de716; }
.c2x2 { background: #d1821b; }
.c3x2 { background: #6dafe6; }
.c2x3 { background: #5c235c; }
.c3x3 { background: #cf0cd6; }

.inventory-item {
  border: 1px solid #3d2b1f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  text-align: center;
  font-weight: bold;
}

.inventory-container * {
  background: blue;
  width: 100%;
  height: 100%;
}
.helm {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: helm;
}
.amulet {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: amulet;
}
.weapon {
  width: 10rem;
  height: 15rem;
  grid-area: weapon;
}
.body-armour {
  width: 6.7rem;
  height: 11.3rem;
  grid-area: body-armour;
}
.offhand {
  width: 10rem;
  height: 15rem;
  grid-area: offhand;
}
.ring {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: ring;
}
.belt {
  width: 6.7rem;
  height: 3.84rem;
  grid-area: belt;
}

.ring2 {
  width: 3.52rem;
  height: 3.84rem;
  grid-area: ring2;

}
.gloves {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: gloves;
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

}

.relic {
  width: 3.52rem;
  height: 3.84rem;
}

.charm {
  width: 3.52rem;
  height: 3.52rem;
}

.boots {
  width: 6.7rem;
  height: 6.7rem;
  grid-area: boots;

}

.grid-wrapper {
  width: 100%; /* например */
  height: 100%px; /* например */
  margin: 0 auto;
  position: relative;
}

.test-button {
  padding: 0;
  margin-top: 1rem;
}

</style>
