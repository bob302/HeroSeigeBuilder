import type { EquipmentRarity } from "../models/Equipment";

export default class ColorUtils {
  static rarityToColor(rarity: EquipmentRarity | null): string {
    switch (rarity) {
      case "Common":
        return "#d6ac2f";
      case "Satanic":
        return "#c81717";
      case "Angelic":
        return "#fdfea5";
      case "Unholy":
        return "#c73664";
      case "Heroic":
        return "#00e19a";
      case "Satanic Set":
        return "#0bb01a";
      default:
        return "";
    }
  }

  static rarityToColorRGBA(rarity: EquipmentRarity | null): string {
    switch (rarity) {
      case "Common":
        return "rgba(214, 172, 47, 0.6)"; 
      case "Satanic":
        return "rgba(200, 23, 23, 0.6)";
      case "Angelic":
        return "rgba(253, 254, 165, 0.6)"; 
      case "Unholy":
        return "rgba(199, 54, 100, 0.6)"; 
      case "Heroic":
        return "rgba(0, 225, 154, 0.6)"; 
      case "Satanic Set":
        return "rgba(11, 176, 26, 0.6)"; 
      default:
        return "rgba(0, 0, 0, 0)";
    }
  }
  

  static rarityToBackground(rarity: EquipmentRarity | null): string {
    switch (rarity) {
      case "Satanic":
        return "/img/editor/item-background-satanic.png";
      case "Angelic":
        return "/img/editor/item-background-angelic.png";
      case "Unholy":
        return "/img/editor/item-background-unholy.png";
      case "Heroic":
        return "/img/editor/item-background-heroic.png";
      case "Satanic Set":
        return "/img/editor/item-background-set.png";
      default:
        return "/img/editor/item-background-regular.png";
    }
  }

  static formatString(input: string): string {
    if (!input) return input;

    const replaced = input.replace(/-/g, " ");

    return replaced.charAt(0).toUpperCase() + replaced.slice(1);
  }

  static unformatString(input: string): string {
    if (!input) return input;

    return input.toLowerCase().replace(/\s+/g, "-");
  }
}
