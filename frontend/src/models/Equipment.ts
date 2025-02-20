import { v4 as uuidv4 } from 'uuid';

export enum EquipmentRarity {
  Common = 'Common',
  Satanic = 'Satanic',
  'Satanic Set' = 'Satanic Set',
  Heroic = 'Heroic',
  Mythic = 'Mythic',
  Angelic = 'Angelic',
  Unholy = 'Unholy'
}

export enum EquipmentType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Accessory = 'Accessory',
  Special = 'Special',
  Misc = 'Misc'
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
  socketable: Socketable | null
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
  [EquipmentType.Special]: ['Charm', 'Glyph', 'Relic', 'Potion'],
  [EquipmentType.Misc]: ['Socketable']
};

export type EquipmentSubtype = typeof EquipmentSubtypes[EquipmentType][number];

export function isValidSubtype(type: EquipmentType, subtype: string): boolean {
  return EquipmentSubtypes[type]?.includes(subtype) ?? false;
}

export interface BaseItemProps {
  uuid: string;
  name: string;
  image?: string;
  isLoading?: boolean;
  size: { width: number; height: number };
  type: EquipmentType;
  subtype: string;
  rarity: EquipmentRarity;
  tier: EquipmentTier;
  level: string;
  stats: Stat[]
}

export class BaseItem {
  public uuid: string
  public name: string;
  public image?: string;
  public isLoading: boolean;
  public size: { width: number; height: number };
  public rarity: EquipmentRarity;
  public stats: Stat[];
  public tier: EquipmentTier;
  public level: string;
  public type: EquipmentType;
  public subtype: string

  constructor(props: BaseItemProps) {
    this.uuid = uuidv4()
    this.name = props.name;
    this.image = props.image;
    this.isLoading = props.isLoading ?? false;
    this.size = props.size;
    this.rarity = props.rarity;
    this.stats = props.stats;
    this.tier = props.tier;
    this.level = props.level;
    this.type = props.type;
    this.subtype = props.subtype;

    if (!isValidSubtype(props.type, props.subtype)) {
      throw new Error(`Invalid subtype ${props.subtype} for type ${props.type}`);
    }
  }

  clone(): BaseItem {
    return new BaseItem({
      uuid: uuidv4(),
      name: this.name,
      image: this.image,
      isLoading: this.isLoading,
      size: { ...this.size },
      type: this.type,
      subtype: this.subtype,
      rarity: this.rarity,
      tier: this.tier,
      level: this.level,
      stats: this.stats.map(stat => ({ ...stat }))
    });
  }

  serialize(): BaseItemProps & { __type: string } {
    return {
      __type: 'BaseItem',
      uuid: this.uuid,
      name: this.name,
      image: this.image,
      isLoading: this.isLoading,
      size: { ...this.size },
      type: this.type,
      subtype: this.subtype,
      rarity: this.rarity,
      tier: this.tier,
      level: this.level,
      stats: this.stats.map(stat => ({ ...stat }))
    };
  }
  
}

export interface EquipmentProps extends BaseItemProps {
  sockets: { amount: number; min: number; max: number; list: Socket[] };
}

export class Equipment extends BaseItem {
  public sockets: { amount: number; min: number; max: number; list: Socket[] };

  constructor(props: EquipmentProps) {
    super(props);

    const sockets = {
      amount: props.sockets.amount,
      min: props.sockets.min,
      max: props.sockets.max,
      list: props.sockets.list.map(socket => ({
        prismatic: socket.prismatic,
        socketable: socket.socketable ? socket.socketable.clone() : null
      }))
    };
    
    

    
    this.sockets = sockets;
  }

  insertSocketable(socketable: Socketable): boolean {
    const emptySocket = this.sockets.list.find(socket => socket.socketable === null);
    
    if (!emptySocket) {
      return false;
    }
  
    emptySocket.socketable = socketable;

    return true;
  }

  clearSocketables(): void {
    this.sockets.list.forEach(socket => socket.socketable = null);
  }
  
  clone(): Equipment {
    return new Equipment({
      ...super.clone(),
      sockets: {
        amount: this.sockets.amount,
        min: this.sockets.min,
        max: this.sockets.max,
        list: this.sockets.list.map(socket => ({
          prismatic: socket.prismatic,
          socketable: socket.socketable?.clone() || null
        }))
      }
    } as EquipmentProps);
  }

  serialize(): EquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: 'Equipment',
      sockets: {
        amount: this.sockets.amount,
        min: this.sockets.min,
        max: this.sockets.max,
        list: this.sockets.list.map(socket => ({
          prismatic: socket.prismatic,
          socketable: socket.socketable?.serialize() ?? null
        }))
      }
    };
  }
}

export interface SocketableProps extends EquipmentProps {
  amount: number;
}

export class Socketable extends Equipment {
  public readonly type: EquipmentType = EquipmentType.Misc;
  public readonly subtype: string = 'Socketable';
  public amount: number;

  constructor(props: SocketableProps) {
    super({
      ...props,
      size: { width: 1, height: 1 },
      sockets: {amount: 0, min: 0, max: 0, list: []}
    });

    this.amount = props.amount
  }

  clone(): Socketable {
    return new Socketable({
      ...super.clone(),
      amount: this.amount
    } as SocketableProps);
  }

  serialize(): SocketableProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: 'Socketable',
      amount: this.amount
    };
  }
}

export interface WeaponEquipmentProps extends EquipmentProps {
  weaponStats: { APSStat: string; attackDamageStat: string; twoHanded: boolean };
}

export class WeaponEquipment extends Equipment {
  public weaponStats: { APSStat: string; attackDamageStat: string; twoHanded: boolean };

  constructor(props: WeaponEquipmentProps) {
    super(props);
    this.weaponStats = props.weaponStats;
  }

  clone(): WeaponEquipment {
    return new WeaponEquipment({
      ...super.clone(),
      weaponStats: { ...this.weaponStats }
    } as WeaponEquipmentProps);
  }

  serialize(): WeaponEquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: 'WeaponEquipment',
      weaponStats: { ...this.weaponStats }
    };
  }
}

export interface ArmorEquipmentProps extends EquipmentProps {
  armorStats: { defense: string };
}

export class ArmorEquipment extends Equipment {
  public armorStats: { defense: string };

  constructor(props: ArmorEquipmentProps) {
    super(props);
    this.armorStats = props.armorStats;
  }

  clone(): ArmorEquipment {
    return new ArmorEquipment({
      ...super.clone(),
      armorStats: { ...this.armorStats }
    } as ArmorEquipmentProps);
  }

  serialize(): ArmorEquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: 'ArmorEquipment',
      armorStats: { ...this.armorStats }
    };
  }
}

export class CharmEquipment extends Equipment {
  constructor(props: EquipmentProps) {
    super({ ...props, type: EquipmentType.Special, subtype: 'Charm' });
  }

  clone(): CharmEquipment {
    return new CharmEquipment({
      ...super.clone()
    } as EquipmentProps);
  }

  serialize(): EquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: 'CharmEquipment'
    };
  }
}

export function createSocket(prismatic: boolean): Socket {
  return {
    prismatic,
    socketable: null
  };
}

export function createEquipment(partial: Partial<EquipmentProps>): Equipment {
  const defaults: EquipmentProps = {
    uuid: uuidv4(),
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
    size: { width: 1, height: 2 },
  };

  const props = { ...defaults, ...partial } as EquipmentProps;
  return new Equipment(props);
}

// Deserialization function
export function deserialize(data: any): BaseItem {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Recursively deserialize all properties
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].map((item: any) => deserialize(item));
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      data[key] = deserialize(data[key]);
    }
  }

  switch (data.__type) {
    case 'BaseItem':
      return new BaseItem(data);
    case 'Equipment':
      return new Equipment(data as EquipmentProps);
    case 'WeaponEquipment':
      return new WeaponEquipment(data as WeaponEquipmentProps);
    case 'ArmorEquipment':
      return new ArmorEquipment(data as ArmorEquipmentProps);
    case 'CharmEquipment':
      return new CharmEquipment(data as EquipmentProps);
    case 'Socketable':
      return new Socketable(data as SocketableProps);
    default:
      throw new Error(`Unknown __type: ${data.__type}`);
  }
}
