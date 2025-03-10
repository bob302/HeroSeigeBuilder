export enum EquipmentType {
  Weapon = "Weapon",
  Offhand = "Offhand",
  Armor = "Armor",
  Accessory = "Accessory",
  Special = "Special",
  Socketable = "Socketable",
}

export enum EquipmentRarity {
  Common = "Common",
  Satanic = "Satanic",
  "Satanic Set" = "Satanic Set",
  Heroic = "Heroic",
  Rare = "Rare",
  Mythic = "Mythic",
  Angelic = "Angelic",
  Unholy = "Unholy",
  Runeword = "Runeword",
}

export enum EquipmentTier {
  SS = "SS",
  S = "S",
  A = "A",
  B = "B",
  C = "C",
  D = "D",
}

export const subtypeDirectoryMap: Record<string, string> = {
  "amulet": "amulets",
  "axe": "axes",
  "belt": "belts",
  "body armor": "bodyarmors",
  "book": "books",
  "boots": "boots",
  "bow": "bows",
  "cane": "canes",
  "chainsaw": "chainsaws",
  "charm": "charms",
  "claw": "claws",
  "dagger": "daggers",
  "flask": "flasks",
  "gloves": "gloves",
  "gun": "guns",
  "helmet": "helmets",
  "mace": "maces",
  "polearm": "polearms",
  "potion": "potions",
  "ring": "rings",
  "shield": "shields",
  "socketable": "socketables",
  "spellblade": "spellblades",
  "staff": "staves",
  "sword": "swords",
  "throwing weapon": "throwingweapon",
  "wand": "wands",
  "relic": "relics"
};

export const typeDirectoryMap: Record<EquipmentType, string[]> = {
  [EquipmentType.Accessory]: ["amulets", "belts", "rings", "multitype"],
  [EquipmentType.Armor]: ["bodyarmors", "boots", "gloves", "helmets", "multitype"],
  [EquipmentType.Offhand]: ["shields", "multitype"],
  [EquipmentType.Socketable]: ["socketables"],
  [EquipmentType.Weapon]: [
    "axes",
    "books",
    "bows",
    "canes",
    "chainsaws",
    "claws",
    "daggers",
    "flasks",
    "guns",
    "maces",
    "polearms",
    "spellblades",
    "staves",
    "swords",
    "throwingweapon",
    "wands",
    "multitype"
  ],
  [EquipmentType.Special]: ["charms", "potions", "relics"]
};

export const typeDirectoryMapAll = Object.values(typeDirectoryMap).flat();


export const EquipmentSubtypes: Record<EquipmentType, string[]> = {
  [EquipmentType.Weapon]: [
    "Sword",
    "Dagger",
    "Mace",
    "Axe",
    "Claw",
    "Polearm",
    "Chainsaw",
    "Staff",
    "Cane",
    "Wand",
    "Book",
    "Spellblade",
    "Bow",
    "Gun",
    "Flask",
    "Throwing Weapon"
  ],
  [EquipmentType.Armor]: ["Helmet", "Body Armor", "Gloves", "Boots"],
  [EquipmentType.Offhand]: ["Shield"],
  [EquipmentType.Accessory]: ["Amulet", "Ring", "Belt"],
  [EquipmentType.Special]: ["Charm", "Glyph", "Relic", "Potion"],
  [EquipmentType.Socketable]: ["Rune", "Jewel", "Gem"]
};
