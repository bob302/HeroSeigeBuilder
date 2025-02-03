import { Equipment, Stat } from '@/models/Equipment'

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
      oneHanded: rawItem.oneHanded,
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
