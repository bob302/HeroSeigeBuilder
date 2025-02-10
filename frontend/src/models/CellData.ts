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

export class CellData {
  coordinates!: Point2D
  private cellSize!: number
  private color!: string
  private state: CellState
  private highhlightState: HightLightCellState
  isEdge: boolean = false

  defaultColor: string = "black";
  validColor: string = "green";
  invalidColor: string = "red";
  replacementColor: string = "none";
  occupiedColor: string = "#344feb"

  constructor(coordinates: Point2D, cellSize: number = 44) {
    this.highhlightState = HightLightCellState.None
    this.state = CellState.Free
    this.coordinates = coordinates;
    this.cellSize = cellSize;
    this.updateColor()
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

  setCellSize(cellSize: number) {
    this.cellSize = cellSize
  }

  setData(newCoordinates: Point2D, newSize: number): void {
    this.coordinates = newCoordinates
    this.cellSize = newSize
  }

}
