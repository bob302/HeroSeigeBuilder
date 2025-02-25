export class Point2D {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  equals(other: Point2D): boolean {
    return this.x === other.x && this.y === other.y;
  }

  add(other: Point2D): Point2D {
    return new Point2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: Point2D): Point2D {
    return new Point2D(this.x - other.x, this.y - other.y);
  }

  isValid(): boolean {
    return this.x >= 0 && this.y >= 0;
  }
}
