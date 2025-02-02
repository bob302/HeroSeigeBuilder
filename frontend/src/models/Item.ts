import { Stat } from './Stat'

export interface Item {
  name: string
  type: string
  subtype: string
  tier: string
  stats: Stat[]
  sockets: { amount: number; list: { enhanced: boolean }[] }
  image?: string
  combinedType: string
  equipmentType: string
  rarity: string
  baseType: string
  isLoading: boolean
}
