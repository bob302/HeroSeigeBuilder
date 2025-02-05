export class StatFormatter {
  static formatFromRangeToRangeWithValue (line: string): string {
    const rangeMatch = line.match(/\[(\d+)-(\d+)\]/)
    const valueMatch = line.match(/([+-]?\d+%?)/)

    if (!rangeMatch || !valueMatch) {
      return line
    }

    const value = valueMatch[0]

    return line.replace(rangeMatch[0], value) + rangeMatch[0]
  }
}
