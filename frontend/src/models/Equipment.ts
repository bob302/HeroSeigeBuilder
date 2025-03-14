import { v4 as uuidv4 } from "uuid";
import { equipmentService } from "../service/EquipmentService";
import { StatParser } from "../parser/StatParser";
import { EquipmentRarity, EquipmentSubtypes, EquipmentTier, EquipmentType } from "../util/Enums";
import { isValidImageSource } from "../util/SourceValidator";


export const socketHardCap = 16

export function getEquipmentTypeBySubtype(subtype: EquipmentSubtype): EquipmentType {
  for (const typeKey in EquipmentSubtypes) {
    const type = typeKey as EquipmentType;
    if (EquipmentSubtypes[type].includes(subtype)) {
      return type;
    }
  }

  throw new Error(`No EquipmentType for ${subtype}`)
}

export type EquipmentSubtype = (typeof EquipmentSubtypes)[EquipmentType][number];

export function isValidSubtype(type: EquipmentType, subtype: EquipmentSubtype): boolean {
  return subtype === "MultiType" ? true : EquipmentSubtypes[type]?.includes(subtype) ?? false;
}

export interface Socket {
  prismatic: boolean;
  socketable: Socketable | null;
}

export interface Stat {
  raw: string;
  value: number;
  range: { from: number; to: number };
  type: "flat" | "percent" | "flat-range" | "percent-range";
  special: boolean;
}

export interface BaseItemProps {
  uuid?: string;
  name: string;
  image?: string;
  isLoading?: boolean;
  size: { width: number; height: number };
  type: EquipmentType;
  subtype: EquipmentSubtype;
  rarity: EquipmentRarity;
  tier: EquipmentTier;
  level: number;
  stats: Stat[];
}

export class BaseItem {
  public uuid?: string;
  public name: string;
  public image?: string;
  public isLoading: boolean;
  public size: { width: number; height: number };
  public rarity: EquipmentRarity;
  public stats: Stat[];
  public tier: EquipmentTier;
  public level: number;
  public type: EquipmentType;
  public subtype: EquipmentSubtype;

  constructor(props: BaseItemProps) {
    this.uuid = uuidv4();
    this.name = props.name;
    if (props.image && !isValidImageSource(props.image)) {
      throw new Error(`Potentially malicious image source detected, saved file has been modified from an external source`);
    }
    this.image = props.image;
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
      throw new Error(
        `Invalid subtype ${props.subtype} for type ${props.type}`,
      );
    }
  }

  addStat(string : string, special = false) {
    const stat = StatParser.parseStat(string, special, true).stat
    this.stats.push(stat)
  }

  removeStat(index: number) {
    this.stats.splice(index, 1)
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
      stats: this.stats.map((stat) => ({ ...stat })),
    });
  }

  serialize(): BaseItemProps & { __type: string } {
    return {
      __type: "BaseItem",
      name: this.name,
      image: this.image,
      size: { ...this.size },
      type: this.type,
      subtype: this.subtype,
      rarity: this.rarity,
      tier: this.tier,
      level: this.level,
      stats: this.stats.map((stat) => ({ ...stat })),
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
      amount: props.sockets.amount > socketHardCap ? socketHardCap : props.sockets.amount,
      min: props.sockets.min < 0 ? 0 : props.sockets.min,
      max: props.sockets.max > socketHardCap ? socketHardCap : props.sockets.max,
      list: props.sockets.list.map((socket) => ({
        prismatic: socket.prismatic,
        socketable: socket.socketable,
      })),
    };

    this.sockets = sockets;
  }

  insertSocketable(socketable: Socketable): boolean {
    const emptySocket = this.sockets.list.find(
      (socket) => socket.socketable === null,
    );

    if (!emptySocket) {
      return false;
    }

    emptySocket.socketable = socketable;

    return true;
  }

  clearSocketables(): void {
    this.sockets.list.forEach((socket) => (socket.socketable = null));
  }

  cloneAsRuneword(runeword: IRuneword): Equipment & IRuneword {
    const clonedItem = this.clone() as Equipment & IRuneword;
    
    clonedItem.name = runeword.name;
    clonedItem.bases = [...runeword.bases];
    clonedItem.runes = [...runeword.runes];
    
    return clonedItem;
  }

  clone(): Equipment {
    return new Equipment({
      ...super.clone(),
      sockets: {
        amount: this.sockets.amount,
        min: this.sockets.min,
        max: this.sockets.max,
        list: this.sockets.list.map((socket) => ({
          prismatic: socket.prismatic,
          socketable: socket.socketable?.clone() || null,
        })),
      },
    } as EquipmentProps);
  }

  serialize(): EquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: "Equipment",
      sockets: {
        amount: this.sockets.amount,
        min: this.sockets.min,
        max: this.sockets.max,
        list: this.sockets.list.map((socket) => ({
          prismatic: socket.prismatic,
          socketable: socket.socketable?.serialize() ?? null,
        })),
      },
    };
  }
}

export interface IRuneword {
  name: string;
  runes: string[];
  bases: string[];
}

export async function transformToRuneword<T extends Equipment>(
  item: T, 
  runeword: IRuneword
): Promise<T & IRuneword> {
  const clonedItem = item.clone() as T & IRuneword;

  clonedItem.name = runeword.name;
  clonedItem.rarity = 'Runeword' as EquipmentRarity;
  
  clonedItem.sockets.amount = runeword.runes.length;
  clonedItem.sockets.max = runeword.runes.length;
  
  clonedItem.clearSocketables();
  
  runeword.runes.forEach(async runeStr => {
    const rune = await equipmentService.getSocketableAsync(runeStr);
    if (!rune) throw new Error(`Rune ${runeStr} не найдена`);
    clonedItem.insertSocketable(rune);
  });

  (clonedItem as any).bases = [...runeword.bases];
  (clonedItem as any).runes = [...runeword.runes];

  return clonedItem;
}

export class Socketable extends BaseItem {
  constructor(props: BaseItemProps) {
    super({
      ...props,
      size: { width: 1, height: 1 },
    });

    this.type = EquipmentType.Socketable;
  }

  clone(): Socketable {
    return new Socketable({
      ...super.clone(),
    });
  }

  serialize(): any & { __type: string } {
    return {
      __type: "Socketable",
      name: this.name,
    };
  }
}

export class CustomSocketable extends Socketable {
  constructor(props: BaseItemProps) {
    super({
      ...props,
    });

    this.type = EquipmentType.Socketable;
  }

  clone(): CustomSocketable {
    return new CustomSocketable({
      ...super.clone(),
    });
  }

  serialize(): BaseItemProps & { __type: string } {
    // Create a serialization based on BaseItem, not Socketable
    const baseItemProps: BaseItemProps = {
      name: this.name,
      image: this.image,
      size: { ...this.size },
      type: this.type,
      subtype: this.subtype,
      rarity: this.rarity,
      tier: this.tier,
      level: this.level,
      stats: this.stats.map((stat) => ({ ...stat })),
    };
    
    return {
      ...baseItemProps,
      __type: "CustomSocketable",
    };
  }
}

export interface WeaponEquipmentProps extends EquipmentProps {
  weaponStats: {
    APSStat: string;
    attackDamageStat: string;
    twoHanded: boolean;
  };
}

export class WeaponEquipment extends Equipment {
  public weaponStats: {
    APSStat: string;
    attackDamageStat: string;
    twoHanded: boolean;
  };

  constructor(props: WeaponEquipmentProps) {
    super(props);
    this.weaponStats = props.weaponStats;
  }

  clone(): WeaponEquipment {
    return new WeaponEquipment({
      ...super.clone(),
      weaponStats: { ...this.weaponStats },
    } as WeaponEquipmentProps);
  }

  serialize(): WeaponEquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: "WeaponEquipment",
      weaponStats: { ...this.weaponStats },
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
      armorStats: { ...this.armorStats },
    } as ArmorEquipmentProps);
  }

  serialize(): ArmorEquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: "ArmorEquipment",
      armorStats: { ...this.armorStats },
    };
  }
}

export class CharmEquipment extends Equipment {
  constructor(props: EquipmentProps) {
    super({ ...props, type: EquipmentType.Special, subtype: "Charm" });
  }

  clone(): CharmEquipment {
    return new CharmEquipment({
      ...super.clone(),
    } as EquipmentProps);
  }

  serialize(): EquipmentProps & { __type: string } {
    const base = super.serialize();
    return {
      ...base,
      __type: "CharmEquipment",
    };
  }
}

export function createSocket(prismatic: boolean): Socket {
  return {
    prismatic,
    socketable: null,
  };
}

export function createEquipment(partial: Partial<EquipmentProps>): Equipment {
  const defaults: EquipmentProps = {
    uuid: uuidv4(),
    name: "",
    type: EquipmentType.Special,
    subtype: "Charm",
    rarity: EquipmentRarity.Unholy,
    tier: EquipmentTier.SS,
    stats: [],
    level: 100,
    sockets: { amount: 0, min: 0, max: 0, list: [] },
    image: "/img/editor/f.png",
    isLoading: false,
    size: { width: 1, height: 2 },
  };

  const props = { ...defaults, ...partial } as EquipmentProps;
  return new Equipment(props);
}

// Asynchronous Deserialization function
export async function deserialize(data: any): Promise<BaseItem> {
  if (data === null || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    const results = await Promise.all(data.map(item => deserialize(item)));
    return results as unknown as BaseItem;
  }

  const copiedData = structuredClone(data);

  const processValue = async (value: any): Promise<any> => {
    if (value?.__type) return await deserialize(value);
    if (Array.isArray(value)) {
      return await Promise.all(value.map(v => processValue(v)));
    }
    if (typeof value === "object" && value !== null) {
      for (const k of Object.keys(value)) {
        value[k] = await processValue(value[k]);
      }
    }
    return value;
  };

  if (copiedData.__type) {
    for (const k of Object.keys(copiedData)) {
      copiedData[k] = await processValue(copiedData[k]);
    }

    if (copiedData.__type === "CustomSocketable") {
      return new CustomSocketable(copiedData);
    }

    if (copiedData.__type === EquipmentType.Socketable) {
      const socketable = await equipmentService.getSocketableAsync(copiedData.name);
      if (!socketable)
        throw new Error(`Socketable not found: ${copiedData.name}`);
      return socketable;
    }

    switch (copiedData.__type) {
      case "BaseItem":
        return new BaseItem(copiedData);
      case "Equipment":
        return new Equipment(copiedData);
      case "WeaponEquipment":
        return new WeaponEquipment(copiedData);
      case "ArmorEquipment":
        return new ArmorEquipment(copiedData);
      case "CharmEquipment":
        return new CharmEquipment(copiedData);
      default:
        throw new Error(`Unknown __type: ${copiedData.__type}`);
    }
  }

  return copiedData;
}