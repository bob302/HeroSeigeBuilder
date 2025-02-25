import {
  Socketable,
  BaseItem,
  EquipmentType,
} from "../models/Equipment";
import { ItemParser } from "../parser/ItemParser";

class EquipmentService {
  private typePaths: Record<string, string[]> = {};
  private typeCache = new Map<string, BaseItem[]>();
  private imageCache = new Map<string, HTMLImageElement>();
  private socketableMap = new Map<string, Socketable>();
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

  private async fetchItem(path: string): Promise<BaseItem | null> {
    try {
      const dataResponse = await fetch(`${path}/data.json`);
      if (!dataResponse.ok) throw new Error("Data load failed");

      const jsonData = await dataResponse.json();
      const parsedItem = ItemParser.parseWikiItem(jsonData);

      const imageUrl = `${path}/icon.png`;
      try {
        await this.loadImage(imageUrl);
        parsedItem.image = imageUrl;
      } catch {
        console.warn("Image load failed:", imageUrl);
        parsedItem.image = "/img/fallback-icon.png";
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
  public async initialize(onLoaded?: () => void): Promise<void> {
    if (this.isInitialized) return;

    try {
      const response = await fetch("/data/index.json");
      const paths: string[] = await response.json();
      this.groupPathsByType(paths);
      // Socketables
      this.loadType("Misc");

      if (onLoaded) {
        onLoaded();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize equipment service:", error);
    }
  }

  private groupPathsByType(paths: string[]): void {
    this.typePaths = paths.reduce(
      (acc, path) => {
        const [, , type] = path.split("/");
        if (!acc[type]) acc[type] = [];
        acc[type].push(path);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  // haha
  private getEquipmentTypeBySubtype(subtype: string): EquipmentType | null {
    switch (subtype.toLowerCase()) {
      case "amulets":
        return EquipmentType.Accessory;
      case "axes":
        return EquipmentType.Weapon;
      case "belts":
        return EquipmentType.Accessory;
      case "bodyarmors":
        return EquipmentType.Armor;
      case "books":
        return EquipmentType.Weapon;
      case "boots":
        return EquipmentType.Armor;
      case "bows":
        return EquipmentType.Weapon;
      case "canes":
        return EquipmentType.Weapon;
      case "chainsaws":
        return EquipmentType.Weapon;
      case "charms":
        return EquipmentType.Special;
      case "claws":
        return EquipmentType.Weapon;
      case "daggers":
        return EquipmentType.Weapon;
      case "flasks":
        return EquipmentType.Weapon;
      case "gloves":
        return EquipmentType.Armor;
      case "guns":
        return EquipmentType.Weapon;
      case "helmets":
        return EquipmentType.Weapon;
      case "maces":
        return EquipmentType.Weapon;
      case "polearms":
        return EquipmentType.Weapon;
      case "potions":
        return EquipmentType.Special;
      case "rings":
        return EquipmentType.Accessory;
      case "shields":
        return EquipmentType.Armor;
      case "socketables":
        return EquipmentType.Misc;
      case "spellblades":
        return EquipmentType.Weapon;
      case "staves":
        return EquipmentType.Weapon;
      case "swords":
        return EquipmentType.Weapon;
      case "throwingweapon":
        return EquipmentType.Weapon;
      case "wands":
        return EquipmentType.Weapon;
      default:
        return null;
    }
  }

  public async loadType(type: string): Promise<BaseItem[]> {
    if (this.typeCache.has(type)) {
      return this.typeCache.get(type)!;
    }

    const paths: string[] = [];
    for (const subtype in this.typePaths) {
      const equipmentType = this.getEquipmentTypeBySubtype(subtype);
      if (equipmentType === type) {
        paths.push(...this.typePaths[subtype]);
      }
    }

    const items = await Promise.all(paths.map((path) => this.fetchItem(path)));

    const validItems = items.filter((i): i is BaseItem => !!i);
    this.typeCache.set(type, validItems);

    return validItems;
  }

  public getItems(type: string): BaseItem[] {
    return this.typeCache.get(type) || [];
  }

  public getSocketable(name: string): Socketable | undefined {
    return this.socketableMap.get(name);
  }
}

export const equipmentService = new EquipmentService();
