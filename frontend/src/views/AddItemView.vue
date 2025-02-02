<template>
<!-- PREVIEW -->
<div class="editor-page-container">
  <div class="preview-container">
  <ItemFrameComponent
    :name=item.name
    :combined-item-type="item.combinedType"
    :image="item.image"
    :sockets="item.sockets.list"
    :stats="item.stats"
    :tier="item.tier"
    :rarity="item.rarity"
  />
</div>
<div class="editor-container">
  <div class="column-left">
    <!-- SOCKETS -->
    <div class="item-sockets-container">
    <label class="block mt-3">Сокеты:</label>
    <!-- SOCKETS CONTROLS -->
    <div class="sockets-controls flex gap-2 mt-2">
      <button @click="addSocket(item)" class="bg-blue-600 px-4 py-2 rounded">Добавить сокет</button>
      <button @click="removeSocket(item)" class="bg-red-600 px-4 py-2 rounded">Удалить сокет</button>
    </div>
    <!-- SOCKETS CONTAINER -->
    <div class="sockets flex gap-2 mt-2">
      <button
        v-for="(socket, index) in item.sockets.list"
        :key="index"
        @click="toggleEnhanced(socket)"
        class="socket-button"
        :class="{ 'enhanced': socket.enhanced }"
      >
        <img
          :src="socket.enhanced ? enhancedSocketImage : normalSocketImage"
          class="socket-img"
        />
      </button>
    </div>
    <!-- IMAGE -->
    <div class="item-image-container">
      <label class="block mt-3">Изображение:</label>
      <input type="file" @change="onFileChange" class="w-full p-2 bg-gray-800 rounded border border-gray-700" />
    </div>
    <!-- SAVE -->
    <div class="item-save-container">
      <button @click="saveItem" class="mt-4 bg-green-600 px-4 py-2 w-full rounded">Сохранить (Скопировать JSON)</button>
    </div>
    </div>
  </div>
  <div class="column-right">
<!-- ADD ITEM -->
<div class="item-add-container">
    <h2 class="text-2xl font-bold mb-4 text-center">Настойки предмета</h2>
  </div>
  <!-- NAME -->
  <div class="item-name-container">
    <label class="text">Название:</label>
    <input class="input" v-model="item.name"/>
  </div>
  <!-- TIER -->
  <div class="item-tier-container">
    <label class="block mt-3">Тир:</label>
    <select v-model="item.tier" class="w-full p-2 bg-gray-800 rounded border border-gray-700">
      <option class="tier-ss">SS</option>
      <option class="tier-s">S</option>
      <option class="tier-a">A</option>
      <option class="tier-b">B</option>
      <option class="tier-c">C</option>
      <option class="tier-d">D</option>
    </select>
  </div>
  <!-- RARITY -->
  <div class="item-rarity-container">
    <label class="block mt-3">Редкость:</label>
    <select v-model="item.rarity" class="w-full p-2 bg-gray-800 rounded border border-gray-700">
      <option disabled value="">Выберите редкость</option>
      <option v-for="rarity in equipmentRarities" :key="rarity" :value="rarity">{{ rarity }}</option>
    </select>
  </div>
  <!-- TYPE -->
  <div class="item-type-container">
    <label class="block mt-3">Тип:</label>
    <select v-model="item.equipmentType" class="w-full p-2 bg-gray-800 rounded border border-gray-700">
      <option disabled value="">Выберите тип</option>
      <option v-for="type in equipmentTypes" :key="type" :value="type">{{ type }}</option>
    </select>
  </div>
  <!-- SUBTYPE -->
  <div class="item-subtype-container">
    <label v-if="item.equipmentType" class="block mt-3">Подтип:</label>
    <select v-if="item.equipmentType" v-model="item.subtype" class="w-full p-2 bg-gray-800 rounded border border-gray-700">
      <option disabled value="">Выберите подтип</option>
      <option v-for="subtype in getSubtypes(item.equipmentType)" :key="subtype" :value="subtype">{{ subtype }}</option>
    </select>
  </div>
    <!-- TEXTAREA ДЛЯ ВВОДА СТАТОВ -->
    <div class="stat-parser-container">
    <label class="block mt-3">Вставьте статы:</label>
    <textarea
      v-model="statsInput"
      class="w-full h-24 p-2 mt-2 bg-gray-800 border border-gray-700 rounded"
      placeholder="Введите статы..."
    ></textarea>
    <button @click="parseStats" class="mt-2 bg-green-600 px-4 py-2 rounded">Парсить</button>
  </div>
  <div class="item-parser-container">
    <label class="block mt-3">Парсить предмет:</label>
<textarea v-model="rawInput" class="w-full h-32 p-2 border rounded" placeholder="Paste JSON here..."></textarea>
    <button @click="parseItem" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Parse Item</button>
  </div>

</div>
</div>
  <!-- STAT TABLE -->
<div class="stat-table-container">
  <label class="block mt-3">Свойства:</label>
  <table class="w-full mt-2 border border-gray-700">
    <thead>
      <tr class="bg-gray-800">
        <th class="p-2 border border-gray-700">Стат</th>
        <th class="p-2 border border-gray-700">Особый</th>
        <th class="p-2 border border-gray-700">Удалить</th>
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
          <td colspan="5" class="p-2 text-center text-gray-500">Загрузка...</td>
        </tr>
      </template>
    </tbody>
  </table>
  <!-- ADD STAT -->
  <button @click="addStat" class="mt-3 bg-blue-600 px-4 py-2 rounded">Добавить стат</button>
</div>
</div>

</template>

<script setup lang="ts">
// TODO: REWRITE THIS BS
import { ref, computed, watch } from 'vue'
import ItemFrameComponent from '@/components/ItemFrameComponent.vue'
import { Item } from '@/models/Item'
import { Socket } from '@/models/Socket'
import { StatParser } from '@/services/StatParser'
import { ItemParser } from '@/services/ItemParser'

const statsInput = ref('')
const rawInput = ref('')

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

const parseStats = () => {
  const parsedStats = StatParser.parseStats(statsInput.value)
  item.value.stats.push(...parsedStats)
  statsInput.value = ''
}

const addStat = () => {
  item.value.stats.push({ raw: '', name: '', value: 0, range: { from: 0, to: 0 }, type: 'flat', special: false })
}

const removeStat = (item: Item, index: number) => {
  item.stats.splice(index, 1)
}

const item = ref<Item>({
  name: '',
  type: 'Weapon',
  subtype: '',
  tier: 'D',
  stats: [],
  sockets: { amount: 0, list: [] },
  image: '',
  combinedType: '',
  equipmentType: '',
  rarity: '',
  baseType: '',
  isLoading: false
})

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

const getSubtypes = (type: string): string[] => {
  switch (type) {
    case 'Weapon':
      return weaponTypes
    case 'Armor':
      return armorTypes
    case 'Jewellery':
      return jewelleryTypes
    case 'Special':
      return specialTypes
    default:
      return []
  }
}

const equipmentRarities = ['Satanic', 'Set', 'Heroic', 'Mythic', 'Angelic', 'Unholy']
const equipmentTypes = ['Weapon', 'Armor', 'Jewellery', 'Special']

const weaponTypes = [
  'Sword',
  'Dagger',
  'Mace',
  'Axe',
  'Claw',
  'Polearm',
  'Chainsaw',
  'Staff',
  'Cane',
  'Wand',
  'Book',
  'Spellblade',
  'Bow',
  'Gun',
  'Flask',
  'Throwing Weapon'
]

const armorTypes = ['Helmet', 'Body Armor', 'Gloves', 'Boots', 'Shield']
const jewelleryTypes = ['Amulet', 'Ring', 'Belt']
const specialTypes = ['Charm', 'Glyph', 'Relic', 'Potion']

const saveItem = () => {
  const json = JSON.stringify(item.value, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON скопирован в буфер обмена!')
  })
}

const combinedType = computed(() => {
  return `${item.value.rarity} ${item.value.subtype}`
})

watch([() => item.value.rarity, () => item.value.subtype], () => {
  item.value.combinedType = combinedType.value
})

watch(() => item.value.stats, (newStats, oldStats) => {
  item.value.stats = newStats
  console.log('Stats updated:', newStats)
}, { deep: true })

const normalSocketImage = '/img/editor/socket-normal.png'
const enhancedSocketImage = '/img/editor/socket-enhanced.png'

const addSocket = (item: Item) => {
  if (item.sockets.list.length < 6) {
    item.sockets.list.push({ enhanced: false })
    item.sockets.amount++
  }
}

const removeSocket = (item: Item) => {
  if (item.sockets.list.length > 0) {
    item.sockets.list.pop()
    item.sockets.amount--
  }
}

const toggleEnhanced = (socket: Socket) => {
  socket.enhanced = !socket.enhanced
}

</script>

<style scoped>
body {
  background-color: #121212;
  font-family: 'Inter', sans-serif;
}

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

</style>
