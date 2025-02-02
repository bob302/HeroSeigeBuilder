import { Stat } from '@/models/Stat'

export class StatParser {
  static parseStats (statsString: string): Stat[] {
    const stats: Stat[] = []
    const lines = statsString.split('\n').filter((line) => line.trim() !== '')

    lines.forEach((line) => {
      const stat = this.parseStat(line.trim())
      if (stat) {
        stats.push(stat.stat)
      }
    })

    return stats
  }

  static parseStat (line: string, special = false): { html: string, stat: Stat } {
    const valueRegex = /(?<!\[)[+-]?\d+(?:%|)(?!\])(?=\s|$)/g
    const rangeRegex = /\[(\d+)-(\d+)\]/g
    const allSkillRegex = /to All Skills/

    const matches: Array<{type: string, start: number, end: number, content: string}> = []

    let match
    while ((match = valueRegex.exec(line)) !== null) {
      matches.push({
        type: 'value',
        start: match.index,
        end: match.index + match[0].length,
        content: match[0]
      })
    }

    while ((match = rangeRegex.exec(line)) !== null) {
      matches.push({
        type: 'range',
        start: match.index,
        end: match.index + match[0].length,
        content: match[0]
      })
    }

    matches.sort((a, b) => a.start - b.start)

    let lastPos = 0
    const tokens: Array<{type: 'value'|'range'|'description', content: string}> = []

    for (const m of matches) {
      if (m.start > lastPos) {
        const desc = line.slice(lastPos, m.start).trim()
        if (desc) tokens.push({ type: 'description', content: desc })
      }

      tokens.push({ type: m.type as 'value'|'range', content: m.content })
      lastPos = m.end
    }

    if (lastPos < line.length) {
      const desc = line.slice(lastPos).trim()
      if (desc) tokens.push({ type: 'description', content: desc })
    }
    const rangeMatch = line.match(/\[(\d+)-(\d+)\]/)
    const valueMatch = line.match(/([+-]?\d+%?)(?=\s*|\s?[a-zA-Z\s( )])/)

    const range = rangeMatch
      ? { from: parseInt(rangeMatch[1]), to: parseInt(rangeMatch[2]) }
      : { from: 0, to: 0 }

    const value = valueMatch ? this.parseValue(valueMatch[1]) : 0
    const type = valueMatch?.includes('%') ? 'percent' : 'flat'

    const stat: Stat = {
      raw: line,
      name: tokens.filter(t => t.type === 'description').map(t => t.content).join(' '),
      value,
      range,
      type,
      special: false
    }

    if (special) {
      const html = `<div class="stat-container"><p class="stat-special">${line}</p></div>`
      return { html, stat }
    }

    if (allSkillRegex.exec(line) !== null) {
      const html = `<div class="stat-container"><p class="stat-allskills">${line}</p></div>`
      return { html, stat }
    }

    let html = '<div class="stat-container">'
    for (const token of tokens) {
      switch (token.type) {
        case 'value':
          html += `<p class="stat-value">${token.content}</p>`
          break
        case 'range':
          html += `<p class="stat-range">${token.content}</p>`
          break
        default:
          html += `<p class="stat-description">${token.content}</p>`
      }
    }
    html += '</div>'

    return { html, stat }
  }

  static parseValue (value: string): number {
    return value.includes('%') ? parseInt(value.replace('%', '')) : parseInt(value)
  }
}
