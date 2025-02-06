<template>
  <!-- Бургер-кнопка -->
  <button class="burger-menu" :class="{ 'active': isMenuOpen }" @click="toggleMenu" aria-label="Toggle filters">
    <span class="burger-line"></span>
    <span class="burger-line"></span>
    <span class="burger-line"></span>
  </button>
  <div class="search-container" :class="{ 'mobile-visible': isMenuOpen }">
      <!-- ... существующие элементы поиска ... -->
      <div class="show-sockets-container">
        <p class="show-sockets-name">Show Sockets:</p>
        <input type="checkbox" v-model="showSockets" class="show-sockets-input" />
      </div>
      <input type="text" v-model="searchQuery" placeholder="Search by Equipment name..." class="search-input" />
      <input type="text" v-model="statQuery" placeholder="Search by Stat name..." class="search-input" />
      <select v-model="typeQuery" class="search-input">
        <option value="">Select Type...</option>
        <option v-for="(subtypes, type) in EquipmentSubtypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <select v-model="subtypeQuery" class="search-input" :disabled="!typeQuery">
        <option value="">Select Subtype...</option>
        <option v-for="subtype in EquipmentSubtypes[typeQuery] || []" :key="subtype" :value="subtype">
          {{ subtype }}
        </option>
      </select>
    </div>
  <div class="item-list-container">
    <!-- Контейнер поиска -->
    <!-- Остальной контент -->
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="list">
      <!-- ... существующий список элементов ... -->
      <ItemFrameComponent v-for="(item, index) in filteredItems" :show-sockets="showSockets" :key="index" :item="item" :x="index % 4" :y="Math.floor(index / 4)" />
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
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

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
/* Стили для бургер-кнопки */
.burger-menu {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  padding: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  flex-direction: column;
  gap: 5px;
}

.burger-line {
  width: 25px;
  height: 3px;
  background: white;
  transition: all 0.3s ease;
}

/* Анимация бургера в крестик */
.burger-menu.active .burger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-menu.active .burger-line:nth-child(2) {
  opacity: 0;
}

.burger-menu.active .burger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Адаптация search-container */
.search-container {
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.search-input {
    width: 15%;
    height: 15%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

.item-list-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.list {
  display: grid;
  grid-template-columns: 1fr repeat(11, 1fr) 1fr;
}

.show-sockets-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* Медиа-запросы */
@media (max-width: 768px) {
  .burger-menu {
    display: flex;
    align-items: flex-end;
  }

  .search-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    padding: 2rem 1rem;
    transform: translateX(-100%);
    overflow-y: auto;
    flex-direction: column;
    justify-content: flex-end;
    z-index: 100;
  }

  .search-container.mobile-visible {
    transform: translateX(0);
  }

  .search-input {
    width: 100%;
    height: 8%;
    max-width: none;
    margin: 0.5rem 0;
  }

  .list {
    grid-template-columns: 1fr repeat(1, 1fr) 1fr;
  }
}
</style>