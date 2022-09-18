var canvas = document.getElementById('canvas');
var ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext('2d');
var Point = /** @class */ (function () {
    /**
     * @param {number} [x = 0]
     * @param {number} [y = 0]
     */
    function Point(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        /** @var {number} - is position on OX axis */
        this.x = x;
        /** @var {number} - is position on OY axis */
        this.y = y;
    }
    Point.prototype.drawPoint = function (x, y) {
        if (ctx) {
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.arc(x, y, 3, 0, 360, false);
            ctx.stroke();
            ctx.fill();
        }
    };
    return Point;
}());
var Line = /** @class */ (function () {
    /**
     * @param {Point} start
     * @param {Point} end
     */
    function Line(start, end) {
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
    Line.prototype.getA = function () {
        return this.start.y - this.end.y;
    };
    /**
     * @return {number} - the B coefficient in Ax+By+C=0
     * @constructor
     */
    Line.prototype.getB = function () {
        return this.end.x - this.start.x;
    };
    /**
     * @return {number} - the C coefficient in Ax+By+C=0
     * @constructor
     */
    Line.prototype.getC = function () {
        return this.start.x * (this.end.y - this.start.y)
            + this.start.y * (this.start.x - this.end.x);
    };
    /**
     * @return {Point | null} - the point of intersection of two straight lines
     * - solving linear systems using Cramer's Rule
     */
    Line.prototype.getPointCrossWithLine = function (line) {
        var delta = this.getA() * line.getB() - this.getB() * line.getA();
        var delta1 = -this.getC() * line.getB() - this.getB() * (-line.getC());
        var delta2 = this.getA() * (-line.getC()) + this.getC() * line.getA();
        if (delta) {
            return new Point(delta1 / delta, delta2 / delta);
        }
        return null;
    };
    return Line;
}());
var startXY = new Point(0, 0);
var isStart = true;
var allLines = [];
var allPointsCross = [];
var canvasWidth = 750;
var canvasHeight = 450;
var isPressed = false;
if (canvas) {
    canvas.onclick = function (event) {
        if (isPressed) {
            ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            return;
        }
        if (isStart) {
            ctx === null || ctx === void 0 ? void 0 : ctx.moveTo(event.offsetX, event.offsetY);
            startXY = new Point(event.offsetX, event.offsetY);
            isStart = false;
        }
        else {
            var endXY = new Point(event.offsetX, event.offsetY);
            allLines.push(new Line(startXY, endXY));
            drawPoints();
            findAllCroosPoints();
            isStart = true;
        }
    };
    canvas.oncontextmenu = function (event) {
        ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawLine();
        drawPoints();
        isStart = true;
    };
    canvas.onmousemove = function (event) {
        var dynamicPoints = [];
        if (!isStart && !isPressed) {
            ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx === null || ctx === void 0 ? void 0 : ctx.moveTo(startXY.x, startXY.y);
            ctx === null || ctx === void 0 ? void 0 : ctx.lineTo(event.offsetX, event.offsetY);
            ctx === null || ctx === void 0 ? void 0 : ctx.stroke();
            ctx === null || ctx === void 0 ? void 0 : ctx.beginPath();
            drawLine();
            drawPoints();
            var currentLine = new Line(new Point(startXY.x, startXY.y), new Point(event.offsetX, event.offsetY));
            for (var i = 0; i < allLines.length; i++) {
                var temp = currentLine.getPointCrossWithLine(allLines[i]);
                if (temp) {
                    if (separator(temp, allLines[i], currentLine)) {
                        dynamicPoints.push(temp);
                    }
                }
            }
            dynamicPoints.map(function (point) {
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
}
;
var separator = function (currentX, line1, line2) {
    if (((currentX.x >= line1.start.x && currentX.x <= line1.end.x)
        || (currentX.x <= line1.start.x && currentX.x >= line1.end.x)) &&
        ((currentX.x >= line2.start.x && currentX.x <= line2.end.x)
            || (currentX.x <= line2.start.x && currentX.x >= line2.end.x))) {
        return true;
    }
    return false;
};
var drawLine = function () {
    if (ctx) {
        allLines.map(function (line) {
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
        });
        ctx.stroke();
    }
};
var drawPoints = function () {
    allPointsCross.map(function (point) {
        if (ctx) {
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.arc(point.x, point.y, 3, 0, 360, false);
            ctx.stroke();
            ctx.fill();
        }
    });
};
var findAllCroosPoints = function () {
    if (allLines.length > 1) {
        for (var i = 0; i < allLines.length; i++) {
            for (var j = i + 1; j < allLines.length; j++) {
                var temp = allLines[i].getPointCrossWithLine(allLines[j]);
                if (temp) {
                    if (separator(temp, allLines[i], allLines[j])) {
                        allPointsCross.push(temp);
                    }
                }
            }
        }
    }
};
var button = document.getElementById('btn');
var animation = function () {
    var start;
    var previousTimeStamp;
    var timeanimation = 3000;
    window.requestAnimationFrame(animate);
    function animate(timestamp) {
        if (start === undefined) {
            start = timestamp;
        }
        var elapsed = timestamp - start;
        if (previousTimeStamp !== timestamp) {
            if (ctx) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                allLines.map(function (line) {
                    var startX = line.start.x;
                    var startY = line.start.y;
                    var endX = line.end.x;
                    var endY = line.end.y;
                    var xMiddle = (startX + endX) / 2;
                    var yMiddle = (startY + endY) / 2;
                    var dx = endX - startX;
                    var dy = endY - startY;
                    var sx = startX + dx * elapsed / (2 * timeanimation);
                    var sy = startY + dy * elapsed / (2 * timeanimation);
                    var ex = endX - dx * elapsed / (2 * timeanimation);
                    var ey = endY - dy * elapsed / (2 * timeanimation);
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.fillStyle = 'blue';
                    ctx.arc(xMiddle, yMiddle, 3, 0, 360, false);
                    ctx.fill();
                    var currentLine = new Line(new Point(sx, sy), new Point(ex, ey));
                    var _loop_1 = function (i) {
                        allPointsCross.forEach(function (item) {
                            if (item) {
                                if (separator(item, allLines[i], currentLine)) {
                                    item.drawPoint(item.x, item.y);
                                }
                            }
                        });
                    };
                    for (var i = 0; i < allLines.length; i++) {
                        _loop_1(i);
                    }
                });
            }
            ;
        }
        if (elapsed < timeanimation) {
            previousTimeStamp = timestamp;
            window.requestAnimationFrame(animate);
        }
    }
    ;
};
if (button) {
    button.onclick = function () {
        if (!isPressed) {
            animation();
        }
        ;
        isPressed = true;
    };
}
