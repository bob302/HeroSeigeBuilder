export interface Stat {
  raw: string
  name: string
  value: number
  range: {from: number, to: number}
  type: 'flat' | 'percent' | 'flat-range' | 'percent-range'
  special: boolean
}
