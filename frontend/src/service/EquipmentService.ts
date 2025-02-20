import { Equipment, CharmEquipment } from '../models/Equipment';
import { ItemParser } from '../parser/ItemParser';

class EquipmentService {
  private imageCache = new Map<string, HTMLImageElement>();
  private socketableMap = new Map<string, Equipment>();

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

  public async fetchEquipmentData(): Promise<Equipment[]> {
    try {
      const response = await fetch('/data/index.json');
      const paths: string[] = await response.json();

      const itemPromises = paths.map(async (path) => {
        try {
          const dataResponse = await fetch(`${path}/data.json`);
          if (!dataResponse.ok) throw new Error('Data load failed');

          const jsonData = await dataResponse.json();
          const parsedItem = ItemParser.parseWikiItem(jsonData);
          
          const imageUrl = `${path}/icon.png`;
          try {
            await this.loadImage(imageUrl);
            parsedItem.image = imageUrl;
          } catch {
            console.warn('Image load failed:', imageUrl);
            parsedItem.image = '/img/fallback-icon.png';
          }

          if (parsedItem instanceof CharmEquipment) {
            this.socketableMap.set(parsedItem.name, parsedItem);
          }
          
          return parsedItem;
        } catch (error) {
          console.error(`Error loading item from ${path}:`, error);
          return null;
        }
      });

      return (await Promise.all(itemPromises)).filter((item): item is Equipment => item !== null);
    } catch (error) {
      console.error('Catalog load failed:', error);
      return [];
    }
  }

  public getSocketable(name: string): Equipment | undefined {
    return this.socketableMap.get(name);
  }
}

export const equipmentService = new EquipmentService();
