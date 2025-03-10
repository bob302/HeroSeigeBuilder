import {
  transformToRuneword,
  ArmorEquipment,
  BaseItem,
  CharmEquipment,
  Equipment,
  getEquipmentTypeBySubtype,
  Socketable,
  WeaponEquipment,
  type IRuneword,
  type Socket,
  type Stat,
  type BaseItemProps,
  type EquipmentProps,
  socketHardCap,
} from "../models/Equipment";
import { equipmentService } from "../service/EquipmentService";
import { EquipmentSubtypes, EquipmentType } from "../util/Enums";
import { StatParser } from "./StatParser";
import { v4 as uuidv4 } from "uuid";


export class ItemParser {
  static async parseRuneword(rawItem: any): Promise<(Equipment & IRuneword)[]> {
    let item = ItemParser.parseWikiItem(rawItem) as Equipment;
    const runewords: (Equipment & IRuneword)[] = [];
    if (rawItem.Rarity === "Runeword") {
      const bases: string[] = rawItem.Bases

      let runeword: (Equipment & IRuneword) = await transformToRuneword(item, {
        name: rawItem.Item,
        runes: rawItem.Runes,
        bases: bases
      }) as (Equipment & IRuneword);
      if (bases.length > 1) {
        bases.map(base => {
          let temp = runeword.clone() as (Equipment & IRuneword) 
          temp.name = `${temp.name} (${base})`
          temp.subtype = base
          temp.type = getEquipmentTypeBySubtype(base)
          const imagePath: string = `/runewords/${equipmentService.getDirectoryBySubtype(temp.subtype)}/icon.png`
          temp.image = imagePath;
          let warning = "This Runeword is generated automatically for all possible bases."
          temp.addStat(warning)
          warning = "Values ​​for one-handed and two-handed items may not match the actual ones.";
          temp.addStat(warning)
          const formattedBases = bases.map(b => `[${b}]`).join(' ');
          temp.addStat(formattedBases)
          runewords.push(temp)
        });
      } else {
        const imagePath: string = `/runewords/${equipmentService.getDirectoryBySubtype(runeword.subtype)}/icon.png`
        runeword.image = imagePath;
        runewords.push(runeword)
      }

    }
    
    return runewords;
  }

  

  static parseWikiItem(rawItem: any): BaseItem {
    const subtype = rawItem.Type;
    
    //@ts-ignore
    const type = Object.entries(EquipmentSubtypes).find(([key, subtypes]) =>
      subtypes.includes(subtype)
    )?.[0] as EquipmentType || EquipmentType.Special;
  
    let size = { width: 1, height: 1 };
    const sizeStat = rawItem.Size;
    
    if (sizeStat) {
      const match = sizeStat.match(/(\d+)x?(\d*)/);
      if (match) {
        size.width = match[1] ? parseInt(match[1]) : 1;
        size.height = match[2] ? parseInt(match[2]) : 1;
      }
    }

    const processedStats = ItemParser.processStats(rawItem)
  

    const commonProps: BaseItemProps = {
      uuid: uuidv4(),
      name: rawItem.Item,
      type: type,
      subtype: subtype,
      tier: rawItem.Tier,
      rarity: rawItem.Rarity,
      level: rawItem.Level,
      image: rawItem.Image,
      stats: processedStats,
      isLoading: true,
      size: size,
    };

    if (type === EquipmentType.Socketable) {
      return new Socketable(commonProps);
    }

    const equipmentProps: EquipmentProps = {
      ...commonProps,
      sockets: {
        amount: 0,
        min: 0,
        max: 0,
        list: [] as Socket[],
      },
    } 

    // Socket Amount
 
    const socketStat = ItemParser.getSocketedStat(processedStats);
    
    if (socketStat) {
      ItemParser.processSocketStat(socketStat, equipmentProps)
    }
  
    let item: Equipment;
    
    if (type === EquipmentType.Armor) {
      item = new ArmorEquipment({ ...equipmentProps, armorStats: { defense: rawItem.defense || "0" } });
    } else if (type === EquipmentType.Weapon) {
      item = new WeaponEquipment({
        ...equipmentProps,
        weaponStats: {
          APSStat: rawItem.APS || "0",
          attackDamageStat: rawItem.Damage || "0",
          twoHanded: rawItem.TwoHanded || false,
        },
      });
    } else if (subtype === "Charm") {
      item = new CharmEquipment(equipmentProps);
    } else {
      item = new Equipment(equipmentProps);
    }
  
    return item;
  }

  static processStats(rawItem: any): Stat[] {
    type JsonStat = string | { stat: string; class?: string };

    const processedStats: Stat[] = rawItem.Stats.map((statObj: JsonStat) => {
      if (typeof statObj === 'string') {
        return ItemParser.parseWikiStat(statObj, false);
      } else if (typeof statObj === 'object' && statObj !== null) {
        return ItemParser.parseWikiStat(statObj.stat, statObj.class === 'stat-spell');
      } else {
        console.warn('Unexpected stat format:', statObj);
        return null;
      }
    });

    return processedStats
  }

  static getSocketedStat(stats: Stat[]): Stat | undefined {
    const socketStat = stats.find((stat: Stat) =>
      stat.raw.includes("Socketed"),
    );

    return socketStat;
  }

  static processSocketStat(socketStat: Stat, props: EquipmentProps) {
      const prismaticRegex = /{(\d+)(?:-(\d+))?}/;
      const normalRegex = /\((\d+)(?:-(\d+))?\)/;

      const prismaticMatch = socketStat.raw.match(prismaticRegex);
      const normalMatch = socketStat.raw.match(normalRegex);

      let normalSockets = 0;
      let prismaticSockets = 0;

      if (normalMatch) {
        const min = parseInt(normalMatch[1], 10);
        const max = normalMatch[2] ? parseInt(normalMatch[2], 10) : min;
        normalSockets = max;
      }

      if (prismaticMatch) {
        const min = parseInt(prismaticMatch[1], 10);
        const max = prismaticMatch[2] ? parseInt(prismaticMatch[2], 10) : min;
        prismaticSockets = max;
      }

      if (normalSockets + prismaticSockets <= socketHardCap) {
        props.sockets.min = normalSockets + prismaticSockets;
        props.sockets.max = normalSockets + prismaticSockets;
        props.sockets.amount = props.sockets.max;
        props.sockets.list = [
          ...Array(normalSockets).fill(null).map(() => ({ prismatic: false, socketable: null })),
          ...Array(prismaticSockets).fill(null).map(() => ({ prismatic: true, socketable: null })),
        ];
      } else {
        props.sockets.min = 0
        props.sockets.max = 0
        props.sockets.amount = 0
        props.sockets.list = [
          ...Array(normalSockets).fill(null).map(() => ({ prismatic: false, socketable: null })),
          ...Array(prismaticSockets).fill(null).map(() => ({ prismatic: true, socketable: null })),
        ];
      }
  }

  static parseWikiStat(stat: any, special = false): Stat {
    return StatParser.parseStat(
      stat,
      special,
      false
    ).stat;
  }

  static parseStat(stat: any): Stat {
    return {
      raw: stat.raw,
      value: stat.value,
      range: stat.range.from || stat.range.to ? stat.range : { from: 0, to: 0 },
      type: stat.type,
      special: stat.special,
    };
  }
}
