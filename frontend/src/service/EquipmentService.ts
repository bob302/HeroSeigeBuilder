import {
  Socketable,
  BaseItem,
  type IRuneword,
  Equipment,
} from "../models/Equipment";
import { ItemParser } from "../parser/ItemParser";
import { EquipmentRarity, EquipmentType, subtypeDirectoryMap, typeDirectoryMap } from "../util/Enums";

class EquipmentService {
  private typePaths: Record<string, string[]> = {};
  private itemCache = new Map<string, BaseItem>();
  private imageCache = new Map<string, HTMLImageElement>();
  private fullyLoadedTypes: Set<EquipmentType> = new Set();
  private socketableMap = new Map<string, Socketable>();
  private loadQueue: { type: EquipmentType; priority: number }[] = [];
  private isProcessing = false;
  public isInitialized = false;

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(url)) {
        resolve(this.imageCache.get(url)!);
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
  }

  private async fetchItem(path: string): Promise<BaseItem | (Equipment & IRuneword)[] |null> {
    try {
      if (path.startsWith("/runewords/")) {
        return await this.fetchRuneword(path)
      } else {
        return await this.fetchEquipment(path)
      }
    } catch {
      return null
    }
  }

  private async fetchEquipment(path: string): Promise<BaseItem | null> {
    try {
      const finalPath = `${path}/data.json`
      const imageUrl = `${path}/icon.png`;
      
      const dataResponse = await fetch(finalPath);
      if (!dataResponse.ok) throw new Error("Data load failed");

      const jsonData = await dataResponse.json();
      const parsedItem = ItemParser.parseWikiItem(jsonData);

      try {
        await this.loadImage(imageUrl);
        parsedItem.image = imageUrl;
      } catch {
        console.warn("Image load failed:", imageUrl);
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
      const dataResponse = await fetch(path);
      if (!dataResponse.ok) throw new Error("Data load failed");

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

    try {
      const responseItems = await fetch("/items/index.json");
      const responseRunewords = await fetch("/runewords/index.json");
      const pathsItems: string[] = await responseItems.json();
      const pathsRunewords: string[] = await responseRunewords.json();

      this.groupPathsByType(pathsItems);
      this.groupPathsByType(pathsRunewords);
      
      this.enqueueLoad(EquipmentType.Socketable, 10);
      this.processQueue();
      
      this.isInitialized = true;
      if (onLoad) {
        onLoad()
      }
    } catch (error) {
      console.error("Failed to initialize equipment service:", error);
    }
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
    throw new Error(`No directory for ${key}`);
  }
  return directory;
}



getDirectoriesByType(type: EquipmentType): string[] {
  const directories = typeDirectoryMap[type];
  if (!directories) {
    throw new Error(`No directory for type: ${type}`);
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
    
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.loadQueue.length > 0) {
      const { type } = this.loadQueue.shift()!;

      await this.loadType(type);
    }

    this.isProcessing = false;
  }

  public async loadType(type: EquipmentType): Promise<void> {
    if (this.fullyLoadedTypes.has(type)) return;
    
    const paths = this.getDirectoriesByType(type).flatMap(dir => this.typePaths[dir] || []);
    
    const items = await Promise.all(paths.map((path) => this.fetchItem(path)));
    
    const validItems = items.filter((i): i is BaseItem => !!i);

    const flatItems = validItems.flat();
    
    for (const item of flatItems) {
      if (item instanceof Equipment && item.rarity === EquipmentRarity.Runeword) {
        if (!this.itemCache.has(EquipmentType.Socketable)) {
          this.enqueueLoad(EquipmentType.Socketable, 10);
        }
      }
      this.itemCache.set(item.name, item);
    }

    this.fullyLoadedTypes.add(type);
  }

  public requestLoad(type: EquipmentType): void {
    this.enqueueLoad(type, 10);
    this.processQueue();
  }

  // Holy
  public getItems(type: EquipmentType, onUpdate?: (items: BaseItem[]) => void): BaseItem[] {
    const items = Array.from(this.itemCache.values()).filter(item => item.type === type) || [];
    
    if (onUpdate) {
      if (!this.fullyLoadedTypes.has(type)) {
        const intervalId = setInterval(() => {
          const updatedItems = Array.from(this.itemCache.values()).filter(item => item.type === type) || [];
          onUpdate(updatedItems);
          if (this.fullyLoadedTypes.has(type)) {
            clearInterval(intervalId);
            onUpdate(updatedItems);
          }
        }, 200);
      } else {
        
        onUpdate(items);
      }
    }
    
    return items;
  }
  
  public isTypeFullyLoaded(type: EquipmentType): boolean {
    return this.fullyLoadedTypes.has(type);
  }

  public getSocketable(name: string): Socketable | null {
    return this.socketableMap.get(name) ?? null;
  }
}

export const equipmentService = new EquipmentService();