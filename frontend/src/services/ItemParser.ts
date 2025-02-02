import { Stat } from '@/models/Stat'
import { Item } from '@/models/Item'

export class ItemParser {
  static parseItem (rawItem: any): Item {
    console.log(rawItem)
    return {
      name: rawItem.name,
      type: rawItem.type,
      subtype: rawItem.subtype,
      tier: rawItem.tier,
      stats: rawItem.stats.map(ItemParser.parseStat),
      sockets: rawItem.sockets,
      image: rawItem.image,
      combinedType: rawItem.combinedType,
      equipmentType: rawItem.equipmentType,
      rarity: rawItem.rarity,
      baseType: rawItem.baseType,
      isLoading: true
    }
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
