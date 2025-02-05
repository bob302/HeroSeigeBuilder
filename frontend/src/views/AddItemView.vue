<template>
<!-- PREVIEW -->
<div class="editor-page-container">
  <div class="preview-container">
  <ItemFrameComponent
    :item="item"
    :x="1"
    :y="1"
    :show-sockets="true"
  />
</div>
<div class="editor-container">
  <div class="column-left">
    <!-- SOCKETS -->
    <div class="item-sockets-container">
    <label class="block mt-3">Sockets:</label>
    <!-- SOCKETS CONTROLS -->
    <div class="sockets-controls flex gap-2 mt-2">
      <button @click="addSocket(item)" class="bg-blue-600 px-4 py-2 rounded">Add Socket</button>
      <button @click="removeSocket(item)" class="bg-red-600 px-4 py-2 rounded">Remove Socket</button>
    </div>
    <!-- SOCKETS CONTAINER -->
    <div class="sockets flex gap-2 mt-2">
      <button
        v-for="(socket, index) in item.sockets.list"
        :key="index"
        @click="togglePrismatic(socket)"
        class="socket-button"
        :class="{ 'prismatic': socket.prismatic }"
      >
        <img
          :src="socket.prismatic ? prismaticSocketImage : normalSocketImage"
          class="socket-img"
        />
      </button>
    </div>
    <!-- IMAGE -->
    <div class="item-image-container">
      <label class="block mt-3">Item Image:</label>
      <input type="file" @change="onFileChange" class="w-full p-2 bg-gray-800 rounded border border-gray-700" />
    </div>
    <!-- SAVE -->
    <div class="item-save-container">
      <button @click="saveItem" class="mt-4 bg-green-600 px-4 py-2 w-full rounded">Save (Copy JSON)</button>
    </div>
    </div>
  </div>
  <div class="column-right">
<!-- ADD ITEM -->
<div class="item-add-container">
    <h2 class="text-2xl font-bold mb-4 text-center">Item Settings</h2>
  </div>
  <!-- NAME -->
  <div class="item-name-container">
    <label class="text">Item Name:</label>
    <input class="input" v-model="item.name"/>
  </div>
  <!-- TIER -->
  <div class="item-tier-container">
    <label class="block mt-3">Tier:</label>
    <select v-model="item.tier">
      <option v-for="tier in tierTypes" :key="tier" :value="tier">
        {{ tier }}
      </option>
    </select>
  </div>
    <!-- LEVEL -->
    <div class="item-level-container">
    <label class="text">Level:</label>
    <input class="input" type="range" min="0" max="100" v-model="item.level"/>
  </div>
  <!-- RARITY -->
  <div class="item-rarity-container">
    <label class="block mt-3">Rarity:</label>
    <select v-model="item.rarity">
      <option v-for="rarity in equipmentRarities" :key="rarity" :value="rarity">
        {{ rarity }}
      </option>
    </select>
  </div>
  <!-- TYPE -->
  <div class="item-type-container">
    <label class="block mt-3">Type:</label>
    <select v-model="item.type">
      <option v-for="type in equipmentTypes" :key="type" :value="type">
        {{ type }}
      </option>
    </select>
  </div>
  <!-- SUBTYPE -->
  <div v-if="item.subtype" class="item-subtype-container">
    <label class="block mt-3">Subtype:</label>
    <select v-model="item.subtype">
      <option v-for="subtype in getSubtypes(item.type)" :key="subtype" :value="subtype">
        {{ subtype }}
      </option>
    </select>
  </div>
  <!-- ONE HANDED -->
   <div v-if="isWeapon(item)" class="item-onehanded-container">
    <label class="block mt-3">One Handed?:</label>
    <input type="checkbox" v-model="item.weaponStats.oneHanded" class="w-full bg-gray-800 p-1 rounded" />
   </div>
    <!-- STAT PARSER -->
    <div class="stat-parser-container">
    <label class="block mt-3">Parse stats:</label>
    <textarea
      v-model="statsInput"
      class="w-full h-24 p-2 mt-2 bg-gray-800 border border-gray-700 rounded"
      placeholder="Enter stats..."
    ></textarea>
    <button @click="parseStats" class="mt-2 bg-green-600 px-4 py-2 rounded">Parse Stats</button>
  </div>
  <!-- ITEM PARSER -->
  <div class="item-parser-container">
    <label class="block mt-3">Parse Item:</label>
    <textarea v-model="rawInput" class="w-full h-32 p-2 border rounded" placeholder="Paste JSON here..."></textarea>
    <button @click="parseItem" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Parse Item</button>
  </div>
    <!-- WIKI PARSER -->
  <div class="item-parser-container">
    <label class="block mt-3">Parse Wiki Item:</label>
    <textarea v-model="wikiRawInput" class="w-full h-32 p-2 border rounded" placeholder="Paste JSON here..."></textarea>
    <button @click="parseWikiItem" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Parse wiki Item</button>
  </div>
</div>
</div>
  <!-- STAT TABLE -->
<div class="stat-table-container">
  <table class="stat-table">
    <thead>
      <tr class="bg-gray-800">
        <th class="p-2 border border-gray-700">Stat</th>
        <th class="p-2 border border-gray-700">Special</th>
        <th class="p-2 border border-gray-700">Remove</th>
      </tr>
    </thead>
    <tbody>
      <template v-if="!item.isLoading">
        <tr v-for="(stat, index) in item.stats" :key="index" class="bg-gray-700">
          <td class="p-2 border border-gray-700">
            <input v-model="stat.raw" class="w-full bg-gray-800 p-1 rounded" />
          </td>
          <td class="p-2 border border-gray-700">
            <input type="checkbox" v-model="stat.special" class="w-full bg-gray-800 p-1 rounded" />
          </td>
          <td class="p-2 border border-gray-700 text-center">
            <button @click="removeStat(item, index)" class="bg-red-600 px-3 py-1 rounded">❌</button>
          </td>
        </tr>
      </template>
      <template v-else>
        <tr>
          <td colspan="5" class="p-2 text-center text-gray-500">Loading...</td>
        </tr>
      </template>
    </tbody>
  </table>
  <!-- ADD STAT -->
  <button @click="addStat" class="mt-3 bg-blue-600 px-4 py-2 rounded">Add Stat</button>
</div>
</div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ItemFrameComponent from '../components/ItemFrameComponent.vue'
import { StatParser } from '../services/StatParser'
import { ItemParser } from '../services/ItemParser'
import { ArmorEquipment, Equipment, EquipmentRarity, EquipmentSubtypes, EquipmentTier, EquipmentType, isWeapon, type Socket, WeaponEquipment } from '../models/Equipment'

const item = ref<Equipment>({
  name: 'Generic Item',
  type: EquipmentType.Special,
  subtype: 'Charm',
  tier: EquipmentTier.S,
  level: '100',
  stats: [],
  sockets: { amount: 0, min: 0, max: 0, list: [] },
  image: '',
  rarity: EquipmentRarity.Satanic,
  isLoading: false
})

// Parse Item
const rawInput = ref('')
const wikiRawInput = ref('')

const parseItem = async () => {
  item.value.isLoading = true
  try {
    const parsedItem = await ItemParser.parseItem(JSON.parse(rawInput.value))
    item.value = parsedItem
  } catch (error) {
    console.error('Error parsing item:', error)
  } finally {
    item.value.isLoading = false
  }
  rawInput.value = ''
}

const parseWikiItem = async () => {
  item.value.isLoading = true
  try {
    const parsedItem = await ItemParser.parseWikiItem(JSON.parse(wikiRawInput.value))
    item.value = parsedItem
  } catch (error) {
    console.error('Error parsing item:', error)
  } finally {
    item.value.isLoading = false
  }
  wikiRawInput.value = ''
}
// Stats
const statsInput = ref('')

const parseStats = () => {
  const parsedStats = StatParser.parseStats(statsInput.value)
  item.value.stats.push(...parsedStats)
  statsInput.value = ''
}

const addStat = () => {
  item.value.stats.push({ raw: '', name: '', value: 0, range: { from: 0, to: 0 }, type: 'flat', special: false })
}

const removeStat = (item: Equipment, index: number) => {
  item.stats.splice(index, 1)
}

// Image
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      item.value.image = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}
// Equipment Misc
const equipmentRarities = Object.values(EquipmentRarity)
const equipmentTypes = Object.values(EquipmentType)
const tierTypes = Object.values(EquipmentTier)

const getSubtypes = (type: EquipmentType) => {
  return EquipmentSubtypes[type] || []
}

// Sockets
const normalSocketImage = '/img/editor/socket-normal.png'
const prismaticSocketImage = '/img/editor/socket-prismatic.png'

const addSocket = (item: Equipment) => {
  if (item.sockets.list.length < 6) {
    item.sockets.list.push({ prismatic: false })
    item.sockets.amount++
  }
}

const removeSocket = (item: Equipment) => {
  if (item.sockets.list.length > 0) {
    item.sockets.list.pop()
    item.sockets.amount--
  }
}

const togglePrismatic = (socket: Socket) => {
  socket.prismatic = !socket.prismatic
}

// Save
const saveItem = () => {
  const json = JSON.stringify(item.value, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON скопирован в буфер обмена!')
  })
}

watch(() => item.value.type, (newType, oldType) => {
  if (newType === oldType) return

  const baseItem = {
    name: item.value.name,
    tier: item.value.tier,
    level: item.value.level,
    stats: [...item.value.stats],
    sockets: { ...item.value.sockets },
    image: item.value.image,
    rarity: item.value.rarity,
    isLoading: false
  }

  if (newType === EquipmentType.Armor) {
    item.value = {
      ...baseItem,
      type: newType,
      subtype: item.value.subtype || EquipmentSubtypes[newType]?.[0],
      armorStats: { defense: '0' }
    } as ArmorEquipment
  } else if (newType === EquipmentType.Weapon) {
    item.value = {
      ...baseItem,
      type: newType,
      subtype: item.value.subtype || EquipmentSubtypes[newType]?.[0],
      weaponStats: { APSStat: '0', attackDamageStat: '0', oneHanded: true }
    } as WeaponEquipment
  } else {
    item.value = {
      ...baseItem,
      type: newType,
      subtype: item.value.subtype
    } as Equipment
  }
})

</script>

<style scoped>
form {
  max-width: 700px;
  background: #1e1e1e;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
}

/* Поля ввода */
input, select {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #fff;
  padding: 8px;
  border-radius: 5px;
  transition: 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #6c63ff;
}

button {
  background: #4caf50;
  color: white;
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 5px;
  transition: 0.3s;
}

button:hover {
  background: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 10px;
  border: 1px solid #444;
  text-align: center;
}

th {
  background: #333;
  color: #ddd;
}

.item-image {
  max-width: 100px;
  border-radius: 10px;
  margin-top: 10px;
  border: 2px solid #6c63ff;
}

.item-frame {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-frame img:nth-child(2) {
  position: absolute;
  width: 80%;
  height: 80%;
  object-fit: contain;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.column-left div:nth-child(1n) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.column-right div:nth-child(1n) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.editor-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.preview-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.column-left {
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.column-right {
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.item-sockets-container {
  display: flex;
  flex-direction: column;
}

.item-sockets-container img:nth-child(1n) {
  max-width: 75%;
  max-height: 75%;
}

::v-deep(button.socket-button) {
  background-color: transparent;
  border: transparent;
}

.editor-page-container {
  background-color: #444;
}

.stat-table {
  border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

</style>
