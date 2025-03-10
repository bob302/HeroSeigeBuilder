import {
  Socketable,
  BaseItem,
  type IRuneword,
  Equipment,
} from "../models/Equipment";
import { ItemParser } from "../parser/ItemParser";
import { EquipmentRarity, EquipmentType, subtypeDirectoryMap, typeDirectoryMap, typeDirectoryMapAll } from "../util/Enums";

class EquipmentService {
  private typePaths: Record<string, string[]> = {};
  private itemCache = new Map<string, BaseItem>();
  private imageCache = new Map<string, HTMLImageElement>();
  private fullyLoadedTypes: Set<EquipmentType> = new Set();
  private socketableMap = new Map<string, Socketable>();
  private socketablePromises = new Map<string, Promise<Socketable | null>>();
  private loadQueue: { type: EquipmentType; priority: number }[] = [];
  private isProcessing = false;
  public isInitialized = false;
  private initializePromise: Promise<void> | null = null;
  private retryLimits = {
    image: 3,
    data: 3,
  };
  private retryDelays = {
    image: 1000, // 1 second
    data: 2000, // 2 seconds
  };

  private async loadImage(url: string, retries = 0): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;

      const timeout = setTimeout(() => {
        if (retries < this.retryLimits.image) {
          console.warn(`Image load timeout, retrying (${retries + 1}/${this.retryLimits.image}): ${url}`);
          clearTimeout(timeout);
          setTimeout(() => {
            this.loadImage(url, retries + 1)
              .then(resolve)
              .catch(reject);
          }, this.retryDelays.image);
        } else {
          reject(new Error(`Image load timeout after ${retries} retries: ${url}`));
        }
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        this.imageCache.set(url, img);
        resolve(img);
      };

      img.onerror = (err) => {
        clearTimeout(timeout);
        if (retries < this.retryLimits.image) {
          console.warn(`Image load error, retrying (${retries + 1}/${this.retryLimits.image}): ${url}`);
          setTimeout(() => {
            this.loadImage(url, retries + 1)
              .then(resolve)
              .catch(reject);
          }, this.retryDelays.image);
        } else {
          reject(err);
        }
      };
    });
  }

  private async fetchWithRetry(url: string, retries = 0): Promise<Response> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries < this.retryLimits.data) {
        console.warn(`Fetch failed, retrying (${retries + 1}/${this.retryLimits.data}): ${url}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelays.data));
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  private async fetchItem(path: string): Promise<BaseItem | (Equipment & IRuneword)[] | null> {
    try {
      if (path.startsWith("/runewords/")) {
        return await this.fetchRuneword(path);
      } else {
        return await this.fetchEquipment(path);
      }
    } catch (error) {
      console.error(`Failed to fetch item at ${path}:`, error);
      return null;
    }
  }

  private async fetchEquipment(path: string): Promise<BaseItem | null> {
    try {
      const finalPath = `${path}/data.json`;
      const imageUrl = `${path}/icon.png`;
      
      const dataResponse = await this.fetchWithRetry(finalPath);
      const jsonData = await dataResponse.json();
      const parsedItem = ItemParser.parseWikiItem(jsonData);

      try {
        await this.loadImage(imageUrl);
        parsedItem.image = imageUrl;
      } catch (error) {
        console.warn("Image load failed:", imageUrl, error);
        // Continue without image
      }

      if (parsedItem instanceof Socketable) {
        this.socketableMap.set(parsedItem.name, parsedItem);
      }

      return parsedItem;
    } catch (error) {
      console.error(`Error loading item from ${path}:`, error);
      return null;
    }
  }

  private async fetchRuneword(path: string): Promise<(Equipment & IRuneword)[] | null> {
    try {
      const dataResponse = await this.fetchWithRetry(path);
      const jsonData = await dataResponse.json();
      const parsedRunewords = ItemParser.parseRuneword(jsonData);

      return parsedRunewords;
    } catch (error) {
      console.error(`Error loading runewords from ${path}:`, error);
      return null;
    }
  }

  public async initialize(onLoad?: () => void): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializePromise) return this.initializePromise;

    this.initializePromise = (async () => {
      try {
        const [responseItems, responseRunewords] = await Promise.all([
          this.fetchWithRetry("/items/index.json"),
          this.fetchWithRetry("/runewords/index.json")
        ]);

        const [pathsItems, pathsRunewords] = await Promise.all([
          responseItems.json(),
          responseRunewords.json()
        ]);

        this.groupPathsByType(pathsItems);
        this.groupPathsByType(pathsRunewords);

        this.enqueueLoad(EquipmentType.Socketable, 10);
        await this.processQueue();

        this.isInitialized = true;
        if (onLoad) {
          onLoad();
        }
      } catch (error) {
        console.error("Failed to initialize equipment service:", error);
        // Reset initialization state to allow retry
        this.initializePromise = null;
        throw error;
      }
    })();

    return this.initializePromise;
  }

  private groupPathsByType(paths: string[]): void {
    paths.forEach((path) => {
      const [, , type] = path.split("/");
      if (!this.typePaths[type]) {
        this.typePaths[type] = [];
      }
      this.typePaths[type].push(path);
    });
  }

  getDirectoryBySubtype(subtype: string): string {
    const key = subtype.toLowerCase();
    const directory = subtypeDirectoryMap[key];
    if (!directory) {
      console.warn(`No directory found for subtype: ${key}, using fallback`);
      return Object.values(subtypeDirectoryMap)[0]; // Fallback to first available
    }
    return directory;
  }

  getDirectoriesByType(type: EquipmentType): string[] {
    if (type === null) {
      return typeDirectoryMapAll;
    }

    const directories = typeDirectoryMap[type];
    if (!directories || directories.length === 0) {
      console.warn(`No directories found for type: ${type}, using all directories`);
      return typeDirectoryMapAll;
    }
    return directories;
  }

  private enqueueLoad(type: EquipmentType, priority: number = 1): void {
    const existing = this.loadQueue.find((t) => t.type === type);
    if (existing) {
      existing.priority = Math.max(existing.priority, priority);
    } else {
      this.loadQueue.push({ type, priority });
    }

    this.loadQueue.sort((a, b) => b.priority - a.priority);
    
    // Start processing if not already
    if (!this.isProcessing) {
      this.processQueue().catch(err => 
        console.error("Error processing queue:", err)
      );
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.loadQueue.length > 0) {
        const { type } = this.loadQueue.shift()!;
        await this.loadType(type);
      }
    } catch (error) {
      console.error("Error in queue processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  public async loadType(type: EquipmentType): Promise<void> {
    if (this.fullyLoadedTypes.has(type)) return;
    
    try {
      const directories = this.getDirectoriesByType(type);
      const paths = directories.flatMap(dir => this.typePaths[dir] || []);
      
      if (paths.length === 0) {
        console.warn(`No paths found for type: ${type}`);
        this.fullyLoadedTypes.add(type); // Mark as loaded even if empty
        return;
      }
      
      const itemsPromises = paths.map(path => this.fetchItem(path));
      const items = await Promise.all(itemsPromises);
      
      const validItems = items.filter((i): i is BaseItem | (Equipment & IRuneword)[] => !!i);
      const flatItems = validItems.flat();
      
      for (const item of flatItems) {
        if (item instanceof Equipment && item.rarity === EquipmentRarity.Runeword) {
          if (!this.isTypeFullyLoaded(EquipmentType.Socketable)) {
            this.enqueueLoad(EquipmentType.Socketable, 10);
          }
        }
        this.itemCache.set(item.name, item);
      }

      this.fullyLoadedTypes.add(type);
    } catch (error) {
      console.error(`Error loading type ${type}:`, error);
    }
  }

  public async requestLoad(type: EquipmentType): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.enqueueLoad(type, 10);
    return this.processQueue();
  }

  public async getSocketableAsync(name: string): Promise<Socketable | null> {
    const cachedSocketable = this.socketableMap.get(name);
    if (cachedSocketable) {
      return cachedSocketable;
    }

    let socketablePromise = this.socketablePromises.get(name);
    if (socketablePromise) {
      return socketablePromise;
    }
    
    if (!this.isTypeFullyLoaded(EquipmentType.Socketable)) {
      socketablePromise = this.loadSocketableByName(name);
      this.socketablePromises.set(name, socketablePromise);
      return socketablePromise;
    }
    
    return null;
  }
  
  private async loadSocketableByName(name: string): Promise<Socketable | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.isTypeFullyLoaded(EquipmentType.Socketable)) {
        await this.loadType(EquipmentType.Socketable);
      }
      
      const socketable = this.socketableMap.get(name);
      if (socketable) {
        return socketable;
      }
      
      const directories = this.getDirectoriesByType(EquipmentType.Socketable);
      
      for (const dir of directories) {
        const possiblePaths = this.typePaths[dir] || [];
        
        for (const path of possiblePaths) {
          if (path.toLowerCase().includes(name.toLowerCase())) {
            const item = await this.fetchEquipment(path);
            if (item instanceof Socketable) {
              this.socketableMap.set(name, item);
              return item;
            }
          }
        }
      }
      
      console.warn(`Socketable not found: ${name}`);
      return null;
    } catch (error) {
      console.error(`Error loading socketable ${name}:`, error);
      return null;
    } finally {
      // Clean up promise from cache
      this.socketablePromises.delete(name);
    }
  }

  // Update getItems to support async
  public async getItemsAsync(type: EquipmentType): Promise<BaseItem[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.isTypeFullyLoaded(type) && type !== null) {
      await this.loadType(type);
    }
    
    return Array.from(this.itemCache.values()).filter(item => 
      item.type === type || type === null
    );
  }

  public async getAllItemsAsync(): Promise<BaseItem[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  
    return Array.from(this.itemCache.values());
  }
  
  public isTypeFullyLoaded(type: EquipmentType): boolean {
    return this.fullyLoadedTypes.has(type);
  }

  // Helper method to clear caches and allow re-initialization
  public reset(): void {
    this.itemCache.clear();
    this.imageCache.clear();
    this.socketableMap.clear();
    this.socketablePromises.clear();
    this.fullyLoadedTypes.clear();
    this.loadQueue = [];
    this.isProcessing = false;
    this.isInitialized = false;
    this.initializePromise = null;
  }
}

export const equipmentService = new EquipmentService();