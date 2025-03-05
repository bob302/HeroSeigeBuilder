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
} from "../models/Equipment";
import { equipmentService } from "../service/EquipmentService";
import { EquipmentSubtypes, EquipmentType } from "../util/Enums";
import { StatFormatter } from "../util/StatFormatter";
import { StatParser } from "./StatParser";
import { v4 as uuidv4 } from "uuid";

export class ItemParser {
  static parseItem(rawItem: any): BaseItem {
    const commonProps = {
      uuid: uuidv4(),
      name: rawItem.name,
      type: rawItem.type,
      subtype: rawItem.subtype,
      tier: rawItem.tier,
      rarity: rawItem.rarity,
      level: rawItem.level,
      sockets: rawItem.sockets,
      image: rawItem.image,
      stats: rawItem.stats.map(ItemParser.parseStat),
      isLoading: true,
      size: rawItem.size,
    };

    if (rawItem.type === EquipmentType.Socketable) {
      const socketableProps = {
        ...commonProps,
      };
      return new Socketable(socketableProps);
    }

    if (rawItem.type === EquipmentType.Armor) {
      const armorProps = {
        ...commonProps,
        armorStats: { defense: rawItem.defense || "0" },
      };
      return new ArmorEquipment(armorProps);
    } else if (rawItem.type === EquipmentType.Weapon) {
      let twoHanded = false;

      if (rawItem.twoHanded) {
        twoHanded = rawItem.twoHanded;
      }
      const weaponProps = {
        ...commonProps,
        weaponStats: {
          APSStat: rawItem.APS || "0",
          attackDamageStat: rawItem.Damage || "0",
          twoHanded: twoHanded,
        },
      };
      return new WeaponEquipment(weaponProps);
    } else if (rawItem.subtype === "Charm") {
      return new CharmEquipment(commonProps);
    } else {
      return new Equipment(commonProps);
    }
  }

  static parseRuneword(rawItem: any): (Equipment & IRuneword)[] {
    let item = ItemParser.parseWikiItem(rawItem) as Equipment;
    const runewords: (Equipment & IRuneword)[] = [];
    if (rawItem.Rarity === "Runeword") {
      const bases: string[] = rawItem.Bases

      let runeword: (Equipment & IRuneword) = transformToRuneword(item, {
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

    const commonProps = {
      uuid: uuidv4(),
      name: rawItem.Item,
      type: type,
      subtype: subtype,
      tier: rawItem.Tier,
      rarity: rawItem.Rarity,
      level: rawItem.Level,
      sockets: {
        amount: 0,
        min: 0,
        max: 0,
        list: [] as Socket[],
      },
      image: rawItem.Image,
      stats: processedStats,
      isLoading: true,
      size: size,
    };

    if (type === EquipmentType.Socketable) {
      const socketableProps = {
        ...commonProps,
      };
      return new Socketable(socketableProps);
    }

    // Socket Amount
    const socketStat = processedStats.find((stat: Stat) =>
      stat.name.includes("Socketed"),
    );
    if (socketStat) {
      const prismaticRegex = /{(\d+)(?:-(\d+))?}/;
      const normalRegex = /\((\d+)(?:-(\d+))?\)/;

      const prismaticMatch = socketStat.name.match(prismaticRegex);
      const normalMatch = socketStat.name.match(normalRegex);

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

      commonProps.sockets.min = normalSockets + prismaticSockets;
      commonProps.sockets.max = normalSockets + prismaticSockets;
      commonProps.sockets.amount = commonProps.sockets.max;

      commonProps.sockets.list = [
        ...Array(normalSockets).fill({ prismatic: false }),
        ...Array(prismaticSockets).fill({ prismatic: true }),
      ];
    }
  
    let item: Equipment;
    
    if (type === EquipmentType.Armor) {
      item = new ArmorEquipment({ ...commonProps, armorStats: { defense: rawItem.defense || "0" } });
    } else if (type === EquipmentType.Weapon) {
      item = new WeaponEquipment({
        ...commonProps,
        weaponStats: {
          APSStat: rawItem.APS || "0",
          attackDamageStat: rawItem.Damage || "0",
          twoHanded: rawItem.TwoHanded || false,
        },
      });
    } else if (subtype === "Charm") {
      item = new CharmEquipment(commonProps);
    } else {
      item = new Equipment(commonProps);
    }
  
    return item;
  }

  static parseWikiStat(stat: any, special = false): Stat {
    
    return StatParser.parseStat(
      StatFormatter.formatFromRangeToRangeWithValue(stat),
      special,
    ).stat;
  }

  static parseStat(stat: any): Stat {
    return {
      raw: stat.raw,
      name: stat.name,
      value: stat.value,
      range: stat.range.from || stat.range.to ? stat.range : { from: 0, to: 0 },
      type: stat.type,
      special: stat.special,
    };
  }
}
