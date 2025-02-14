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
};

export function isValidSubtype(type: EquipmentType, subtype: string): boolean {
  return EquipmentSubtypes[type]?.includes(subtype) ?? false;
}

/**
 * Интерфейс с общими параметрами для Equipment
 */
export interface EquipmentProps {
  name: string;
  type: EquipmentType;
  subtype: string;
  rarity: EquipmentRarity;
  tier: EquipmentTier;
  stats: Stat[];
  level: string;
  sockets: { amount: number; min: number; max: number; list: Socket[] };
  image?: string;
  isLoading?: boolean;
  size: {width: number, height: number};
}

export class Equipment {
  public name: string;
  public type: EquipmentType;
  public subtype: string;
  public rarity: EquipmentRarity;
  public tier: EquipmentTier;
  public stats: Stat[];
  public level: string;
  public sockets: { amount: number; min: number; max: number; list: Socket[] };
  public image?: string;
  public isLoading: boolean;
  public size: {width: number, height: number}

  constructor(props: EquipmentProps) {
    if (!isValidSubtype(props.type, props.subtype)) {
      throw new Error(`Invalid subtype ${props.subtype} for type ${props.type}`);
    }
    this.name = props.name;
    this.type = props.type;
    this.subtype = props.subtype;
    this.rarity = props.rarity;
    this.tier = props.tier;
    this.stats = props.stats;
    this.level = props.level;
    this.sockets = props.sockets;
    this.image = props.image;
    this.isLoading = props.isLoading ?? false;
    this.size = props.size;
  }
}

export interface WeaponEquipmentProps extends EquipmentProps {
  weaponStats: { APSStat: string; attackDamageStat: string; oneHanded: boolean };
}

export class WeaponEquipment extends Equipment {
  public weaponStats: { APSStat: string; attackDamageStat: string; oneHanded: boolean };

  constructor(props: WeaponEquipmentProps) {
    super({ ...props, type: EquipmentType.Weapon });
    this.weaponStats = props.weaponStats;
  }
}

export interface ArmorEquipmentProps extends EquipmentProps {
  armorStats: { defense: string };
}

export class ArmorEquipment extends Equipment {
  public armorStats: { defense: string };

  constructor(props: ArmorEquipmentProps) {
    super({ ...props, type: EquipmentType.Armor });
    this.armorStats = props.armorStats;
  }
}

export class CharmEquipment extends Equipment {
  constructor(props: EquipmentProps) {
    super({ ...props, type: EquipmentType.Special, subtype: 'Charm' });
  }
}

/**
 * Функция-предикат для проверки, является ли предмет оружием
 */
export function isWeapon(item: Equipment): item is WeaponEquipment {
  return 'weaponStats' in item;
}

/**
 * Фабрика для создания экземпляра Equipment с заданными параметрами.
 * Здесь можно задать значения по умолчанию и вернуть корректный экземпляр.
 */
export function createEquipment(partial: Partial<EquipmentProps>): Equipment {
  const defaults: EquipmentProps = {
    name: 'Generic Item',
    type: EquipmentType.Special,
    subtype: 'Charm',
    rarity: EquipmentRarity.Unholy,
    tier: EquipmentTier.SS,
    stats: [],
    level: '100',
    sockets: { amount: 0, min: 0, max: 0, list: [] },
    image: '/img/editor/f.png',
    isLoading: false,
    size: {width: 1, height: 2}
  };

  const props = { ...defaults, ...partial };

  return new Equipment(props);
}
