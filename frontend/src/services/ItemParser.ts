import { ArmorEquipment, CharmEquipment, Equipment, EquipmentSubtypes, EquipmentType, WeaponEquipment, type Socket, type Stat} from '../models/Equipment'
import { StatFormatter } from '../util/StatFormatter'
import { StatParser } from './StatParser'

export class ItemParser {
  static parseItem(rawItem: any): Equipment {
    // Общие поля для всех типов снаряжения
    const commonProps = {
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
  
    // Создание конкретного типа экипировки
    if (rawItem.type === EquipmentType.Armor) {
      const armorProps = {
        ...commonProps,
        armorStats: { defense: rawItem.defense || "0" }
      }
      return new ArmorEquipment(
        armorProps
      );
    } else if (rawItem.type === EquipmentType.Weapon) {
      const weaponProps = {
        ...commonProps,
        weaponStats: {
          APSStat: rawItem.APS || "0",
          attackDamageStat: rawItem.Damage || "0",
          oneHanded: true, // Пока что всегда true, можно сделать динамическим
        }
      }
      return new WeaponEquipment(
        weaponProps
      );
    } else if (rawItem.subtype === "Charm") {
      return new CharmEquipment(
        commonProps
      );
    } else {
      return new Equipment(
        commonProps
      );
    }
  }
  

  static parseWikiItem (rawItem: any): Equipment {
    const subtype = rawItem.Type

    const type = Object.entries(EquipmentSubtypes).find(([key, subtypes]) =>
      subtypes.includes(subtype)
    )?.[0] as EquipmentType || EquipmentType.Special

    let size = { width: 1, height: 1 };
      
    const sizeStat = rawItem.Size;

    if (sizeStat) {
      const match = sizeStat.match(/(\d+)x?(\d*)/)
      if (match) {
        size.width = match[1] ? parseInt(match[1]) : 1;
        size.height = match[2] ? parseInt(match[2]) : 1;
      }
    }

    const commonProps = {
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
      stats: rawItem.Stats.map((statObj: { stat: string, class: string }) => 
        ItemParser.parseWikiStat(statObj.stat, statObj.class === 'stat-spell' ? true : false)),
      isLoading: true,
      size: size,
    };
  

    // Socket Amount
    const socketStat = rawItem.Stats.find((stat: { stat: string }) => stat.stat.includes("Socketed"));
    if (socketStat) {
      const match = socketStat.stat.match(/Socketed \((\d+)-?(\d*)\)/);
      const prismaticMatch = socketStat.stat.match(/Socketed \{(\d+)-?(\d*)\}/);
    
      let normalSockets: number = 0;
      let prismaticSockets: number = 0;
    
      if (match) {
        const minSockets = parseInt(match[1], 10);
        const maxSockets = match[2] ? parseInt(match[2], 10) : minSockets;
    
        normalSockets = maxSockets;
      }
    
      if (prismaticMatch) {
        const minSocketsPrismatic = parseInt(prismaticMatch[1], 10);
        const maxSocketsPrismatic = prismaticMatch[2] ? parseInt(prismaticMatch[2], 10) : minSocketsPrismatic;
    
        prismaticSockets = maxSocketsPrismatic;
      }
    
      commonProps.sockets.min = normalSockets + prismaticSockets;
      commonProps.sockets.max = normalSockets + prismaticSockets;
      commonProps.sockets.amount = commonProps.sockets.max;
    
      commonProps.sockets.list = [
        ...Array(normalSockets).fill({ prismatic: false }),
        ...Array(prismaticSockets).fill({ prismatic: true })
      ];
    }
    
    if (type === EquipmentType.Armor) {
      
      const armorProps = {
        ...commonProps,
        armorStats: { defense: rawItem.defense || "0" }
      }
      return new ArmorEquipment(
        armorProps
      );
    } else if (type === EquipmentType.Weapon) {
      const weaponProps = {
        ...commonProps,
        weaponStats: {
          APSStat: rawItem.APS || "0",
          attackDamageStat: rawItem.Damage || "0",
          oneHanded: true,
        }
      }
      return new WeaponEquipment(weaponProps);
    } else if (subtype === "Charm") {
      return new CharmEquipment(commonProps);
    } else {
      return new Equipment(commonProps);
    }
  }

  static parseWikiStat (stat: any, special = false): Stat {
    return StatParser.parseStat(StatFormatter.formatFromRangeToRangeWithValue(stat), special).stat
  }

  static parseStat (stat: any): Stat {
    return {
      raw: stat.raw,
      name: stat.name,
      value: stat.value,
      range: stat.range.from || stat.range.to ? stat.range : { from: 0, to: 0 },
      type: stat.type,
      special: stat.special
    }
  }
}
