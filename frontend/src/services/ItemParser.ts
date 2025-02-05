import { ArmorEquipment, Equipment, EquipmentSubtypes, EquipmentType, WeaponEquipment, type Stat} from '../models/Equipment'
import { StatFormatter } from '../util/StatFormatter'
import { StatParser } from './StatParser'

export class ItemParser {
  static parseItem (rawItem: any): Equipment {
    return {
      name: rawItem.name,
      type: rawItem.type,
      subtype: rawItem.subtype,
      tier: rawItem.tier,
      rarity: rawItem.rarity,
      level: rawItem.level,
      sockets: rawItem.sockets,
      image: rawItem.image,
      stats: rawItem.stats.map(ItemParser.parseStat),
      isLoading: true
    }
  }

  static parseWikiItem (rawItem: any): Equipment {
    const subtype = rawItem.Type

    const type = Object.entries(EquipmentSubtypes).find(([key, subtypes]) =>
      subtypes.includes(subtype)
    )?.[0] as EquipmentType || EquipmentType.Special

    let baseItem: Equipment = {
      name: rawItem.Item,
      type,
      subtype,
      tier: rawItem.Tier,
      rarity: rawItem.Rarity,
      level: rawItem.Level,
      sockets: {amount: 0, min: 0, max: 0,  list: [] },
      image: rawItem.Image,
      stats: rawItem.Stats.map((statObj: { stat: string, class: string }) => 
        ItemParser.parseWikiStat(statObj.stat, statObj.class === 'stat-spell' ? true : false)
      ),
      isLoading: true
    }

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
    
      baseItem.sockets.min = normalSockets + prismaticSockets;
      baseItem.sockets.max = normalSockets + prismaticSockets;
      baseItem.sockets.amount = baseItem.sockets.max;
    
      baseItem.sockets.list = [
        ...Array(normalSockets).fill({ prismatic: false }),
        ...Array(prismaticSockets).fill({ prismatic: true })
      ];
    }
    
    
    if (type === EquipmentType.Armor) {
      baseItem = {
        ...baseItem,
        armorStats: { defense: rawItem.Defense }
      } as ArmorEquipment
    } else if (type === EquipmentType.Weapon) {
      baseItem = {
        ...baseItem,
        weaponStats: { APSStat: rawItem.APS, attackDamageStat: rawItem.Damage, oneHanded: true }
      } as WeaponEquipment
    }

    return baseItem
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
