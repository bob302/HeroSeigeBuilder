import type { EquipmentSubtype } from "./Equipment";
import { Point2D } from "./Point2D";

export enum CellState {
  Free = "Free",
  Occupied = "Occupied",
}

export enum HightLightCellState {
  ValidPlacement = "ValidPlacement",
  InvalidPlacement = "InvalidPlacement",
  Replacement = "Replacement",
  None = "None",
}

export interface CellStyle {
  width: string;
  height: string;
  border?: string;
  borderImage?: string;
  background?: string;
}
export class Cell {
  coordinates!: Point2D;
  private color!: string;
  private state: CellState;
  private highhlightState: HightLightCellState;
  private cellStyle: CellStyle = {
    width: "2.5rem",
    height: "2.5rem",
    border: "8px solid",
    background: "",
    borderImage: "",
  };

  private unlocked: boolean = true;

  defaultColor: string = "rgba(0, 0, 0, 0)";
  validColor: string = "rgba(100, 185, 50, 0.3)";
  invalidColor: string = "rgba(185, 80, 50, 0.3)";
  replacementColor: string = "rgba(185, 185, 50, 0.3)";
  occupiedColor: string = "rgba(50, 150, 185, 0.3)";

  constructor(coordinates: Point2D) {
    this.highhlightState = HightLightCellState.None;
    this.state = CellState.Free;
    this.coordinates = coordinates;
    this.updateColor();
  }

  getCellStyle() {
    return this.cellStyle;
  }

  setCellStyle(style: CellStyle) {
    if (!style) return;
    this.cellStyle = style;
  }

  isUnlocked() {
    return this.unlocked;
  }

  setIsUnlocked(isUnlocked: boolean) {
    this.unlocked = isUnlocked;
  }

  setHighlightState(state: HightLightCellState) {
    this.highhlightState = state;
    this.updateColor();
  }

  getHighlightState(): HightLightCellState {
    return this.highhlightState;
  }

  setState(state: CellState) {
    this.state = state;
    this.updateColor();
  }

  getState(): CellState {
    return this.state;
  }

  getColor(): string {
    return this.color;
  }

  private highlightStateToColor(): string {
    switch (this.highhlightState) {
      case HightLightCellState.ValidPlacement:
        return this.validColor;
      case HightLightCellState.InvalidPlacement:
        return this.invalidColor;
      case HightLightCellState.Replacement:
        return this.replacementColor;
      default:
        return this.defaultColor;
    }
  }

  private stateToColor(): string {
    switch (this.state) {
      case CellState.Occupied:
        return this.occupiedColor;
      default:
        return this.defaultColor;
    }
  }

  private updateColor() {
    if (this.highhlightState === HightLightCellState.None) {
      this.color = this.stateToColor();
    } else {
      this.color = this.highlightStateToColor();
    }
  }

  setData(newCoordinates: Point2D): void {
    this.coordinates = newCoordinates;
  }

  // ───── Serialization Methods ─────

  serialize(): any {
    const serializedData: any = {
      c: [this.coordinates.x, this.coordinates.y], // Координаты в массиве
      s: this.state !== "Free" ? this.state : undefined, // Только если отличается от "Free"
    };

    if (this.unlocked === false) {
      serializedData.u = false; // Сжимаем `unlocked`
    }

    return serializedData;
  }

  static deserialize(data: any, cellStyle: CellStyle): Cell {
    const point = new Point2D(data.c[0], data.c[1]);
    const cell = new Cell(point);
    cell.setState(data.s ?? "Free");
    cell.setHighlightState(HightLightCellState.None);
    cell.setCellStyle(cellStyle);

    if (data.u === false) {
      cell.setIsUnlocked(false);
    }

    return cell;
  }
}
