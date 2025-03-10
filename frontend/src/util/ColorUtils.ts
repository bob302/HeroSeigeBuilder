import { EquipmentRarity, EquipmentTier } from "./Enums";

export default class ColorUtils {
  static rarityToColor(rarity: EquipmentRarity | null): string {
    switch (rarity) {
      case EquipmentRarity.Common:
        return "var(--color-common)";
      case EquipmentRarity.Satanic:
        return "var(--color-satanic)";
      case EquipmentRarity.Angelic:
        return "var(--color-angelic)";
      case EquipmentRarity.Unholy:
        return "var(--color-unholy)";
      case EquipmentRarity.Heroic:
        return "var(--color-heroic)";
      case EquipmentRarity["Satanic Set"]:
        return "var(--color-satanic-set)";
      case EquipmentRarity.Runeword:
        return "var(--color-runeword)";
      case EquipmentRarity.Rare:
        return "var(--color-rare)";
      case EquipmentRarity.Mythic:
        return "var(--color-mythic)";
      default:
        return "";
    }
  }

  static tierToColor(tier: EquipmentTier | null): string {
    switch (tier) {
      case EquipmentTier.SS:
        return "var(--color-angelic)";
      case EquipmentTier.S:
        return "var(--color-s)";
      case EquipmentTier.A:
        return "var(--color-a)";
      case EquipmentTier.B:
        return "var(--color-b)";
      case EquipmentTier.C:
        return "var(--color-c)";
      case EquipmentTier.D:
        return "var(--color-d)";
      default:
        return "";
    }
  }

  static rarityToColorRGBA(rarity: EquipmentRarity | null): string {
    switch (rarity) {
      case EquipmentRarity.Common:
        return "rgba(214, 172, 47, 0.6)"; 
      case EquipmentRarity.Satanic:
        return "rgba(200, 23, 23, 0.6)";
      case EquipmentRarity.Angelic:
        return "rgba(253, 254, 165, 0.6)"; 
      case EquipmentRarity.Unholy:
        return "rgba(199, 54, 100, 0.6)"; 
      case EquipmentRarity.Heroic:
        return "rgba(0, 225, 154, 0.6)"; 
      case EquipmentRarity["Satanic Set"]:
        return "rgba(11, 176, 26, 0.6)"; 
      case EquipmentRarity.Runeword:
        return "rgba(199, 179, 119, 0.6)";
      case EquipmentRarity.Rare:
        return "rgba(0, 69, 219, 0.6)";
      case EquipmentRarity.Mythic:
        return "rgba(131, 4, 216, 0.6)";
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
