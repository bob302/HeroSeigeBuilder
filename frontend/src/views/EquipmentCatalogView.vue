<template>
  <div class="item-list-container">
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by Equipment name..." 
        class="search-input" 
      />
      <input 
        type="text" 
        v-model="statQuery" 
        placeholder="Search by Stat name..." 
        class="search-input" 
      />
      <select v-model="typeQuery" class="search-input">
        <option value="">Select Type...</option>
        <option v-for="(subtypes, type) in EquipmentSubtypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <select v-model="subtypeQuery" class="search-input" :disabled="!typeQuery">
        <option value="">Select Subtype...</option>
        <option 
          v-for="subtype in EquipmentSubtypes[typeQuery] || []" 
          :key="subtype" 
          :value="subtype"
        >
          {{ subtype }}
        </option>
      </select>
      <div class="show-sockets-container">
        <p class="show-sockets-name">Show Sockets:</p>
        <input 
        type="checkbox" 
        v-model="showSockets"  
        class="show-sockets-input" 
      />
      </div>
    </div>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="list">
      <ItemFrameComponent 
        v-for="(item, index) in filteredItems"
        :show-sockets="showSockets"
        :key="index" 
        :item="item" 
        :x="index % 4" 
        :y="Math.floor(index / 4)" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ItemFrameComponent from '../components/ItemFrameComponent.vue';
import { ItemParser } from '../services/ItemParser';
import { EquipmentSubtypes, isValidSubtype } from '../models/Equipment';

const items = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const statQuery = ref('');
const typeQuery = ref('');
const subtypeQuery = ref('');
const showSockets = ref(false)

const fetchEquipmentData = async () => {
  try {
    const response = await fetch('/data/index.json');
    const paths = await response.json();
    
    const itemPromises = paths.map(async (path) => {
      try {
        const dataResponse = await fetch(path + '/data.json');
        const jsonData = await dataResponse.json();
        const parsedItem = await ItemParser.parseWikiItem(jsonData);
        
        const imageResponse = await fetch(path + '/icon.png');
        if (imageResponse.ok) {
          parsedItem.image = path + '/icon.png';
        }
        
        return parsedItem;
      } catch (error) {
        console.error(`Error loading item from ${path}:`, error);
        return null;
      }
    });
    
    items.value = (await Promise.all(itemPromises)).filter(item => item !== null);
  } catch (error) {
    console.error('Error fetching equipment data:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(typeQuery, () => {
  subtypeQuery.value = '';  // Reset the subtype to default (empty) when type changes
});

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesName = !searchQuery.value || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Новый фильтр для статов
    const matchesStat = !statQuery.value || item.stats.some(stat => 
      stat.name.toLowerCase().includes(statQuery.value.toLowerCase()) || 
      stat.raw.toLowerCase().includes(statQuery.value.toLowerCase())
    );
    
    const matchesType = !typeQuery.value || item.type.toLowerCase().includes(typeQuery.value.toLowerCase());
    const matchesSubtype = !subtypeQuery.value || isValidSubtype(item.type, item.subtype) && item.subtype.toLowerCase().includes(subtypeQuery.value.toLowerCase());
    
    return matchesName && matchesStat && matchesType && matchesSubtype;
  });
});

onMounted(fetchEquipmentData);
</script>

<style scoped>
.loading {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 2rem;
}
.list {
  display: grid;
  grid-template-columns: 1fr repeat(11, 1fr) 1fr;
}
.search-container {
  margin-bottom: 1rem;
  text-align: center;
  display: flex;
  flex-direction: row;
}

.search-input {
  margin: 0.5rem;
  padding: 0.5rem;
  font-size: 1rem;
  width: 80%;
  max-width: 400px;
  margin-bottom: 0.5rem;
}
select.search-input {
  width: 80%;
  max-width: 400px;
}
.show-sockets-container {
  min-width: 10rem;
  display: flex;
  flex-direction: row;
}

.show-sockets-name {
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.item-list-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
