import type { Stat } from "../models/Equipment";
import { StatFormatter } from "../util/StatFormatter";

export class StatParser {
  static parseStats(statsString: string): Stat[] {
    const stats: Stat[] = [];
    const lines = statsString.split("\n").filter((line) => line.trim() !== "");

    lines.forEach((line) => {
      const stat = this.parseStat(line.trim());
      if (stat) {
        stats.push(stat.stat);
      }
    });

    return stats;
  }

  static parseStat(line: string, special = false, format = false): { html: string; stat: Stat } {
    const MAX_LINE_LENGTH = 128;

    const errorStat: Stat = {
      raw: "",
      value: 0,
      range: {from: 0, to: 0},
      type: "flat",
      special: false,
    };
  
    if (line.length > MAX_LINE_LENGTH) {
      return { html: `<div class="stat-container"><p class="stat-error">to LoooOoooNnnG...</p></div>`, stat: errorStat};
    }

    if (format) {
      line = StatFormatter.formatFromRangeToRangeWithValue(line)
    }


    const valueRegex = /(?<!\[)[+-]?\d+(?:%|)(?!\])(?=\s|$)/g;
    const rangeRegex = /\[(\d+)-(\d+)\]/g;
  
    // Mapping special properties: regular expression and corresponding CSS class
    const specialMappings: { regex: RegExp; cssClass: string }[] = [
      { regex: /to All Skills/, cssClass: 'stat-allskills' },
      { regex: /to Arcane Skills/, cssClass: 'stat-to-arcane' },
      { regex: /to Cold Skills/, cssClass: 'stat-to-cold' },
      { regex: /to Fire Skills/, cssClass: 'stat-to-fire' },
      { regex: /to Poison Skills/, cssClass: 'stat-to-poison' },
      { regex: /to Physical Skills/, cssClass: 'stat-to-physical' },
      { regex: /to Lightning Skills/, cssClass: 'stat-to-lightning' },
      { regex: /Unholy Stat/, cssClass: 'stat-unholy' },
      { regex: /Unbreakable/, cssClass: 'stat-unbreakable' },
      { regex: /Random Skill Element/, cssClass: 'stat-random-skill' },
      { regex: /\[Augment\]/, cssClass: 'stat-augment' },
    ];
  
    const matches: Array<{ type: string; start: number; end: number; content: string }> = [];
    let match: RegExpExecArray | null;
    
    while ((match = valueRegex.exec(line)) !== null) {
      matches.push({
        type: "value",
        start: match.index,
        end: match.index + match[0].length,
        content: match[0],
      });
    }
    
    while ((match = rangeRegex.exec(line)) !== null) {
      matches.push({
        type: "range",
        start: match.index,
        end: match.index + match[0].length,
        content: match[0],
      });
    }
    
    matches.sort((a, b) => a.start - b.start);
    
    let lastPos = 0;
    const tokens: Array<{ type: "value" | "range" | "description"; content: string }> = [];
    for (const m of matches) {
      if (m.start > lastPos) {
        const desc = line.slice(lastPos, m.start).trim();
        if (desc) tokens.push({ type: "description", content: desc });
      }
      tokens.push({ type: m.type as "value" | "range", content: m.content });
      lastPos = m.end;
    }
    if (lastPos < line.length) {
      const desc = line.slice(lastPos).trim();
      if (desc) tokens.push({ type: "description", content: desc });
    }
    
    const rangeMatch = line.match(/\[(\d+)-(\d+)\]/);
    const valueMatch = line.match(/([+-]?\d+%?)(?=\s*|\s?[a-zA-Z\s( )])/);
    const range = rangeMatch
      ? { from: parseInt(rangeMatch[1]), to: parseInt(rangeMatch[2]) }
      : { from: 0, to: 0 };
    
    const value = valueMatch ? this.parseValue(valueMatch[1]) : 0;
    const type = valueMatch?.includes("%") ? "percent" : "flat";
    
    const stat: Stat = {
      raw: line,
      value: value,
      range: range,
      type: type,
      special: special,
    };
  
    if (special) {
      return { html: `<div class="stat-container"><p class="stat-special">${line}</p></div>`, stat };
    }
    
    for (const mapping of specialMappings) {
      if (mapping.regex.test(line)) {
        return { html: `<div class="stat-container"><p class="${mapping.cssClass}">${line}</p></div>`, stat };
      }
    }
    
    let html = '<div class="stat-container">';
    for (const token of tokens) {
      if (token.type === "value") {
        html += `<p class="stat-description">${token.content}</p>`;
      } else if (token.type === "range") {
        html += `<p class="stat-range">${token.content}</p>`;
      } else {
        html += `<p class="stat-description">${token.content}</p>`;
      }
    }
    html += "</div>";
    
    return { html, stat };
  }
  
  static parseValue(value: string): number {
    return value.includes("%")
      ? parseInt(value.replace("%", ""))
      : parseInt(value);
  }
}  
