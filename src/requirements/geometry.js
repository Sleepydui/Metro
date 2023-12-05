export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    const fixed = 2;
    return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
  }

  /**
   * 计算两点之间的距离
   * @param p
   * @returns {number}
   */
  distanceToPoint(p) {
    return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
  }
  /**
   * 点到直线的距离
   * @param line {Line}
   * @returns {number}
   */
  distanceToLine(line, epsilon = 1e-13) {
    const d = Math.abs(line.A * this.x + line.B * this.y + line.C) / Math.sqrt(line.A * line.A + line.B * line.B);
    if (d < epsilon) return 0;
    return d;
  }

  /**
   * 点到直线上的投影点
   * @param line {Line}
   * @returns {Point}
   */
  projectionOnLine(line) {
    const A = line.A;
    const B = line.B;
    const C = line.C;
    const x = this.x;
    const y = this.y;
    const x0 = (B * (B * x - A * y) - A * C) / (A * A + B * B);
    const y0 = (A * (-B * x + A * y) - B * C) / (A * A + B * B);
    return new Point(x0, y0);
  }

}
export class LineSegment {
  /**
   * @constructor
   * @param start {Point}
   * @param end {Point}
   */
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  toString() {
    return `${this.start.toString()} -> ${this.end.toString()}`;
  }

  /**
   * 计算线段的长度
   * @return {number}
   */
  length() {
    return this.start.distanceToPoint(this.end);
  }

  /**
   * 计算与直线的交点
   * @param line
   * @returns {Point|null}
   */
  intersectionWithLine(line) {
    const A = line.A;
    const B = line.B;
    const C = line.C;
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;
    const segmentVector = { x: x2 - x1, y: y2 - y1 };
    const t = -(A * x1 + B * y1 + C) / (A * segmentVector.x + B * segmentVector.y);
    if (t >= 0 && t <= 1) {
      return new Point(
          x1 + t * segmentVector.x,
          y1 + t * segmentVector.y
      );
    } else {
      return null;
    }
  }

  /**
   * 线段向两头分别延伸length长度
   * @param length
   */
  extension(length) {
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;
    const segmentVector = { x: x2 - x1, y: y2 - y1 };
    const norm = Math.sqrt(segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y);
    const x3 = x1 - segmentVector.x / norm * length;
    const y3 = y1 - segmentVector.y / norm * length;
    const x4 = x2 + segmentVector.x / norm * length;
    const y4 = y2 + segmentVector.y / norm * length;
    return new LineSegment(new Point(x3, y3), new Point(x4, y4));
  }
}
export class Line {
  /**
   * @constructor Ax + By + C = 0
   * @param A {Number}
   * @param B {Number}
   * @param C {Number}
   */
  constructor(A, B, C) {
    this.A = A;
    this.B = B;
    this.C = C;
  }

  toString() {
    const fixed = 2;
    return `${this.A.toFixed(fixed)}x + ${this.B.toFixed(fixed)}y + ${this.C.toFixed(fixed)} = 0`;
  }

  /**
   * 从两个点创建一条直线
   * @param p1 {Point}
   * @param p2 {Point}
   * @returns {Line}
   */
  static createFromPoints(p1, p2) {
    const A = p2.y - p1.y;
    const B = p1.x - p2.x;
    const C = p2.x * p1.y - p1.x * p2.y;
    return new Line(A, B, C);
  }

  /**
   * 创建经过点p与直线line平行的一条直线
   * @param line {Line}
   * @param p {Point}
   * @returns {Line}
   */
  static createParallelLineThroughPoint(line, p) {
    const A = line.A
    const B = line.B;
    const C = -line.A * p.x - line.B * p.y;
    return new Line(A, B, C);
  }

  /**
   * 计算两条直线的交点
   * @param line {Line}
   * @returns {Point|null}
   */
  intersection(line) {
    const A1 = this.A;
    const B1 = this.B;
    const C1 = this.C;
    const A2 = line.A;
    const B2 = line.B;
    const C2 = line.C;
    const s = A1 * B2 - A2 * B1;
    if (s === 0) return null;
    const x = (B2 * C1 - B1 * C2) / s;
    const y = (A1 * C2 - A2 * C1) / s;
    return new Point(x, y);
  }
}