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
  D = 'D',
}

export interface Socket {
  enhanced: boolean
}

export interface Stat {
  raw: string
  name: string
  value: number
  range: {from: number, to: number}
  type: 'flat' | 'percent' | 'flat-range' | 'percent-range'
  special: boolean
}

export const EquipmentSubtypes: Record<EquipmentType, string[]> = {
  [EquipmentType.Weapon]: [
    'Sword',
    'Dagger',
    'Mace',
    'Axe',
    'Claw',
    'Polearm',
    'Chainsaw',
    'Staff',
    'Cane',
    'Wand',
    'Book',
    'Spellblade',
    'Bow',
    'Gun',
    'Flask',
    'Throwing Weapon'
  ],
  [EquipmentType.Armor]: ['Helmet', 'Body Armor', 'Gloves', 'Boots', 'Shield'],
  [EquipmentType.Accessory]: ['Amulet', 'Ring', 'Belt'],
  [EquipmentType.Special]: ['Charm', 'Glyph', 'Relic', 'Potion']
}

export function isValidSubtype (type: EquipmentType, subtype: string): boolean {
  return EquipmentSubtypes[type]?.includes(subtype) ?? false
}

export interface Equipment {
  name: string
  type: EquipmentType
  subtype: string
  tier: EquipmentTier
  oneHanded: boolean
  level: string
  stats: Stat[]
  sockets: { amount: number; list: { enhanced: boolean }[] }
  image?: string
  rarity: EquipmentRarity
  isLoading: boolean
}
