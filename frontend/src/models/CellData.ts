import type { Point2D } from "./Point2D";

export enum CellState {
  Free = "Free",
  Occupied = "Occupied",
}

export enum HightLightCellState {
  ValidPlacement = "ValidPlacement",
  InvalidPlacement = "InvalidPlacement",
  Replacement = "Replacement",
  None = "None"
}

export interface CellStyle {
  width: string,
  height: string,
  border: string,
  borderImage: string
  isEdge: boolean,
  background: string
}
export class CellData {
  coordinates!: Point2D
  private color!: string
  private state: CellState
  private highhlightState: HightLightCellState
  private cellStyle: CellStyle = {width: '2.9rem', height: '2.9rem', border: '8px solid', isEdge: false, background: '', borderImage: ''}
  private unlocked: boolean = true

  defaultColor: string = "black";
  validColor: string = "green";
  invalidColor: string = "red";
  replacementColor: string = "none";
  occupiedColor: string = "#344feb"

  constructor(coordinates: Point2D) {
    this.highhlightState = HightLightCellState.None
    this.state = CellState.Free
    this.coordinates = coordinates;
    this.updateColor()
  }

  getCellStyle() {
    return this.cellStyle
  }

  setCellStyle(style: CellStyle) {
    if (!style) return
     this.cellStyle = style
  }


  isUnlocked() {
    return this.unlocked
  }

  setIsUnlocked(isUnlocked: boolean) {
    this.unlocked = isUnlocked
  }

  setHighlightState(state: HightLightCellState) {
    this.highhlightState = state;
    this.updateColor();
  }

  getHighlightState(): HightLightCellState {
    return this.highhlightState
  }

  setState(state: CellState) {
    this.state = state;
    this.updateColor();
  }

  getState(): CellState {
    return this.state
  }

  getColor(): string {
    return this.color
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
      this.color = this.highlightStateToColor()
    }
  }

  setData(newCoordinates: Point2D, newSize: number): void {
    this.coordinates = newCoordinates
  }

}
