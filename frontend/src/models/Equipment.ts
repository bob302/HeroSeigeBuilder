export enum EquipmentRarity {
  Satanic = 'Satanic',
  Set = 'Set',
  Heroic = 'Heroic',
  Mythic = 'Mythic',
  Angelic = 'Angelic',
  Unholy = 'Unholy'
}

export enum EquipmentType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Accessory = 'Accessory',
  Special = 'Special'
}

export enum EquipmentTier {
  SS = 'SS',
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface Socket {
  prismatic: boolean;
}

export interface Stat {
  raw: string;
  name: string;
  value: number;
  range: { from: number; to: number };
  type: 'flat' | 'percent' | 'flat-range' | 'percent-range';
  special: boolean;
}

export const EquipmentSubtypes: Record<EquipmentType, string[]> = {
  [EquipmentType.Weapon]: [
    'Sword', 'Dagger', 'Mace', 'Axe', 'Claw', 'Polearm', 'Chainsaw', 'Staff',
    'Cane', 'Wand', 'Book', 'Spellblade', 'Bow', 'Gun', 'Flask', 'Throwing Weapon'
  ],
  [EquipmentType.Armor]: ['Helmet', 'Body Armor', 'Gloves', 'Boots', 'Shield'],
  [EquipmentType.Accessory]: ['Amulet', 'Ring', 'Belt'],
  [EquipmentType.Special]: ['Charm', 'Glyph', 'Relic', 'Potion']
}

export function isValidSubtype (type: EquipmentType, subtype: string): boolean {
  return EquipmentSubtypes[type]?.includes(subtype) ?? false
}

export class Equipment {
  constructor (
    public name: string,
    public type: EquipmentType,
    public subtype: string,
    public rarity: EquipmentRarity,
    public tier: EquipmentTier,
    public stats: Stat[],
    public level: string,
    public sockets: { amount: number; min: number; max: number; list: Socket[] },
    public image?: string,
    public isLoading: boolean = false
  ) {
    if (!isValidSubtype(type, subtype)) {
      throw new Error(`Invalid subtype ${subtype} for type ${type}`)
    }
  }
}

export class WeaponEquipment extends Equipment {
  constructor (
    name: string,
    subtype: string,
    rarity: EquipmentRarity,
    tier: EquipmentTier,
    stats: Stat[],
    level: string,
    sockets:  { amount: number; min: number; max: number; list: Socket[] },
    public weaponStats: { APSStat: string; attackDamageStat: string; oneHanded: boolean },
    image?: string,
    isLoading = false
  ) {
    super(name, EquipmentType.Weapon, subtype, rarity, tier, stats, level, sockets, image, isLoading)
  }
}

export class ArmorEquipment extends Equipment {
  constructor (
    name: string,
    subtype: string,
    rarity: EquipmentRarity,
    tier: EquipmentTier,
    stats: Stat[],
    level: string,
    sockets: { amount: number; min: number; max: number; list: Socket[] },
    public armorStats: { defense: string },
    image?: string,
    isLoading = false
  ) {
    super(name, EquipmentType.Armor, subtype, rarity, tier, stats, level, sockets, image, isLoading)
  }
}

export function isWeapon (item: Equipment): item is WeaponEquipment {
  return 'weaponStats' in item
}
