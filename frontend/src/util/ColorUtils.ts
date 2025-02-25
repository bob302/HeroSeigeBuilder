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
