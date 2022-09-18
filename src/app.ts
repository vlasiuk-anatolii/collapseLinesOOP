const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');

class Point {
  public x: number;
  public y: number;

  /**
   * @param {number} [x = 0]
   * @param {number} [y = 0]
   */
  constructor(x: number = 0, y: number = 0) {
    /** @var {number} - is position on OX axis */
    this.x = x;

    /** @var {number} - is position on OY axis */
    this.y = y;
  }

  drawPoint(x: number, y: number) {
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.arc(x, y, 3, 0, 360, false);
      ctx.stroke();
      ctx.fill();
    }
  }
}

class Line {
  public start: Point;
  public end: Point;

  /**
   * @param {Point} start
   * @param {Point} end
   */
  constructor(start: Point, end: Point) {
    if (!start || !end) {
      throw new Error("Can't create Line with these points");
    }

    this.start = start;
    this.end = end;
  }

  /**
   * @return {number} - the A coefficient in Ax+By+C=0
   * @constructor
   */
  getA(): number {
    return this.start.y - this.end.y;
  }

  /**
   * @return {number} - the B coefficient in Ax+By+C=0
   * @constructor
   */
  getB(): number {
    return this.end.x - this.start.x;
  }

  /**
   * @return {number} - the C coefficient in Ax+By+C=0
   * @constructor
   */
  getC(): number {
    return this.start.x * (this.end.y - this.start.y)
      + this.start.y * (this.start.x - this.end.x);
  }

  /**
   * @return {Point | null} - the point of intersection of two straight lines
   * - solving linear systems using Cramer's Rule
   */

  getPointCrossWithLine(line: Line): Point | null {
    const delta: number = this.getA() * line.getB() - this.getB() * line.getA();
    const delta1: number = -this.getC() * line.getB() - this.getB() * (-line.getC());
    const delta2: number = this.getA() * (-line.getC()) + this.getC() * line.getA();

    if (delta) {
      return new Point(delta1 / delta, delta2 / delta);
    }

    return null;
  }
}

let startXY: Point = new Point(0, 0);
let isStart = true;
let allLines: Line[] = [];
let allPointsCross: Point[] = [];
const canvasWidth = 750;
const canvasHeight = 450;
let isPressed = false;

if (canvas) {
  canvas.onclick = (event) => {
    if (isPressed) {
      ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
      return;
    }
    if (isStart) {
      ctx?.moveTo(event.offsetX, event.offsetY);

      startXY = new Point(event.offsetX, event.offsetY);
      isStart = false;
    } else {
      const endXY = new Point(event.offsetX, event.offsetY);
      allLines.push(new Line(startXY, endXY));
      drawPoints();
      findAllCroosPoints();
      isStart = true;
    }
  };

  canvas.oncontextmenu = (event) => {
    ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
    drawLine();
    drawPoints();
    isStart = true;
  };

  canvas.onmousemove = (event) => {
    const dynamicPoints: Point[] = [];

    if (!isStart && !isPressed) {
      ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx?.moveTo(startXY.x, startXY.y);
      ctx?.lineTo(event.offsetX, event.offsetY);
      ctx?.stroke();
      ctx?.beginPath();
      drawLine();
      drawPoints();

      const currentLine = new Line(new Point(startXY.x, startXY.y), new Point(event.offsetX, event.offsetY));
      for (let i = 0; i < allLines.length; i++) {
        const temp = currentLine.getPointCrossWithLine(allLines[i]);
        if (temp) {
          if (separator(temp, allLines[i], currentLine)) {
            dynamicPoints.push(temp);
          }
        }
      }

      dynamicPoints.map(point => {
        if (ctx) {
          ctx.beginPath();
          ctx.fillStyle = 'red';
          ctx.arc(point.x, point.y, 3, 0, 360, false);
          ctx.stroke();
          ctx.fill();
        }
      });
    }
  };
};

const separator = (currentX: Point, line1: Line, line2: Line) => {
  if (((currentX.x >= line1.start.x && currentX.x <= line1.end.x)
    || (currentX.x <= line1.start.x && currentX.x >= line1.end.x)) &&
    ((currentX.x >= line2.start.x && currentX.x <= line2.end.x)
      || (currentX.x <= line2.start.x && currentX.x >= line2.end.x))) {
    return true;
  }
  return false;
}

const drawLine = () => {
  if (ctx) {
    allLines.map(line => {
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
    });

    ctx.stroke();
  }
}

const drawPoints = () => {
  allPointsCross.map(point => {
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.arc(point.x, point.y, 3, 0, 360, false);
      ctx.stroke();
      ctx.fill();
    }
  });
};

const findAllCroosPoints = () => {
  if (allLines.length > 1) {
    for (let i = 0; i < allLines.length; i++) {
      for (let j = i + 1; j < allLines.length; j++) {
        const temp = allLines[i].getPointCrossWithLine(allLines[j]);
        if (temp) {
          if (separator(temp, allLines[i], allLines[j])) {
            allPointsCross.push(temp);
          }
        }
      }
    }
  }
};

const button = document.getElementById('btn');

const animation = () => {
  let start: number;
  let previousTimeStamp: number;
  const timeanimation = 3000;
  window.requestAnimationFrame(animate);

  function animate(timestamp: number) {
    
    if (start === undefined) {
      start = timestamp;
    }

    let elapsed = timestamp - start;

    if (previousTimeStamp !== timestamp) {

      if (ctx) {

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        allLines.map(line => {
          const startX = line.start.x;
          const startY = line.start.y;
          const endX = line.end.x;
          const endY = line.end.y;
          const xMiddle = (startX + endX) / 2;
          const yMiddle = (startY + endY) / 2;
          const dx = endX - startX;
          const dy = endY - startY;
          const sx = startX + dx * elapsed / (2 * timeanimation);
          const sy = startY + dy * elapsed / (2 * timeanimation);
          const ex = endX - dx * elapsed / (2 * timeanimation);
          const ey = endY - dy * elapsed / (2 * timeanimation);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          ctx.beginPath();
          ctx.fillStyle = 'blue';
          ctx.arc(xMiddle, yMiddle, 3, 0, 360, false);
          ctx.fill();

          const currentLine = new Line(new Point(sx, sy), new Point(ex, ey));

          for (let i = 0; i < allLines.length; i++) {
            allPointsCross.forEach(item => {
              if (item) {

                if (separator(item, allLines[i], currentLine)) {
                  item.drawPoint(item.x, item.y);
                }
              }
            })
          }
        })
      };
    }
    if (elapsed < timeanimation) { 
      previousTimeStamp = timestamp;
      window.requestAnimationFrame(animate);
    }
  };
};

if (button) {
  button.onclick = () => {
    if (!isPressed) {
      animation();
    };

    isPressed = true;
  }
}
