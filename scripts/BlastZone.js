class TemplateGeometry {
  constructor(template) {
    this.template = template;
    this.polygon = this.getPolygon(template);
  }

  getPolygon(template) {
    switch (template.data.t) {
      case CONST.MEASURED_TEMPLATE_TYPES.CIRCLE:
        return TemplateGeometry.getCircle(template.data);
        break;
      case CONST.MEASURED_TEMPLATE_TYPES.CONE:
        return TemplateGeometry.getCone(template.data);
        break;
      case CONST.MEASURED_TEMPLATE_TYPES.RAY:
        return TemplateGeometry.getRay(template.data);
        break;
      case CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE:
        return TemplateGeometry.getRectangle(template.data);
        break;
    }
  }

  static getCircle(tData) {
    const shape = MeasuredTemplate.prototype._getConeShape(
      tData.direction,
      359,
      tData.distance * TemplateGeometry.unitToPx()
    );
    let points = [];
    for (let i = 2; i < shape.points.length - 2; i += 2) {
      points.push(shape.points[i] + tData.x);
      points.push(shape.points[i + 1] + tData.y);
    }
    points.push(shape.points[2] + tData.x);
    points.push(shape.points[3] + tData.y);
    return new PIXI.Polygon(points);
  }

  static getCone(tData) {
    const shape = tData.document._object.shape;
    let points = [];
    for (let i = 0; i < shape.points.length; i += 2) {
      points.push(shape.points[i] + tData.x);
      points.push(shape.points[i + 1] + tData.y);
    }
    return new PIXI.Polygon(points);
  }

  static getRectangle(tData) {
    const ray = tData.document._object.ray;
    const points = [
      tData.x,
      tData.y,
      tData.x + ray.dx,
      tData.y,
      tData.x + ray.dx,
      tData.y + ray.dy,
      tData.x,
      tData.y + ray.dy,
      tData.x,
      tData.y,
    ];
    return new PIXI.Polygon(points);
  }

  static getRay(tData) {
    const ray = tData.document._object.ray;
    const o = ray.A;
    const wp = (tData.width * TemplateGeometry.unitToPx()) / 2;
    const c1 = ray.B;
    const d = tData.distance * TemplateGeometry.unitToPx();
    const points = [
      { x: o.x + (wp * (o.y - c1.y)) / d, y: o.y - (wp * (o.x - c1.x)) / d },
      { x: o.x - (wp * (o.y - c1.y)) / d, y: o.y + (wp * (o.x - c1.x)) / d },
      { x: c1.x - (wp * (o.y - c1.y)) / d, y: c1.y + (wp * (o.x - c1.x)) / d },
      { x: c1.x + (wp * (o.y - c1.y)) / d, y: c1.y - (wp * (o.x - c1.x)) / d },
    ];
    return new PIXI.Polygon(points);
  }

  static unitToPx() {
    return canvas.dimensions.size / canvas.dimensions.distance;
  }

  static drawDebug(template) {
    let g = new PIXI.Graphics();
    g.lineStyle(1, 0x4563ff, 1);
    g.beginFill(0xffffff);
    g.drawShape(TemplateGeometry.getPolygon(template));
    canvas.controls.debug.addChild(g);
  }

  static lineLineIntersection(line1, line2) {
    const x1 = line1.x1;
    const y1 = line1.y1;
    const x2 = line1.x2;
    const y2 = line1.y2;
    const x3 = line2.x1;
    const y3 = line2.y1;
    const x4 = line2.x2;
    const y4 = line2.y2;
    var eps = 0.0000001;
    function between(a, b, c) {
      return a - eps <= b && b <= c + eps;
    }
    var x =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x) || isNaN(y)) {
      return false;
    } else {
      if (x1 >= x2) {
        if (!between(x2, x, x1)) {
          return false;
        }
      } else {
        if (!between(x1, x, x2)) {
          return false;
        }
      }
      if (y1 >= y2) {
        if (!between(y2, y, y1)) {
          return false;
        }
      } else {
        if (!between(y1, y, y2)) {
          return false;
        }
      }
      if (x3 >= x4) {
        if (!between(x4, x, x3)) {
          return false;
        }
      } else {
        if (!between(x3, x, x4)) {
          return false;
        }
      }
      if (y3 >= y4) {
        if (!between(y4, y, y3)) {
          return false;
        }
      } else {
        if (!between(y3, y, y4)) {
          return false;
        }
      }
    }
    return { x: x, y: y };
  }

  getIntersection(wall) {
    const line1 = {
      x1: wall.data.c[0],
      y1: wall.data.c[1],
      x2: wall.data.c[2],
      y2: wall.data.c[3],
    };
    let intersections = [];
    for (let i = 0; i < this.polygon.points.length - 2; i += 2) {
      const line2 = {
        x1: this.polygon.points[i],
        y1: this.polygon.points[i + 1],
        x2: this.polygon.points[i + 2],
        y2: this.polygon.points[i + 3],
      };
      const intersection = TemplateGeometry.lineLineIntersection(line1, line2);
      if (intersection) {
        intersections.push(intersection);
      }
    }
    return intersections;
  }

  isInside(wall) {
    return (
      this.polygon.contains(wall.data.c[0], wall.data.c[1]) &&
      this.polygon.contains(wall.data.c[2], wall.data.c[3])
    );
  }

  isOutside(wall) {
    return (
      !this.polygon.contains(wall.data.c[0], wall.data.c[1]) &&
      !this.polygon.contains(wall.data.c[2], wall.data.c[3])
    );
  }
  
  static getDistance(p1,p2){
      return Math.sqrt(Math.pow(p1.x - p2.x,2) + Math.pow(p1.y - p2.y,2));     
}
}

class BlastZone {
  constructor(template) {
    this.template = template;
    this.wallsToDestroy = [];
    this.wallsToCreate = [];
  }

  async createWalls() {
    canvas.scene.createEmbeddedDocuments("Wall", this.wallsToCreate);
  }

  async destroyWalls() {
    canvas.scene.deleteEmbeddedDocuments("Wall", this.wallsToDestroy);
  }

  get walls() {
    this.templateGeometry = new TemplateGeometry(this.template);
    for (let wall of canvas.walls.placeables) {
      if (this.templateGeometry.isInside(wall)) {
        this.wallsToDestroy.push(wall.id);
        continue
      }
      let intersections = this.templateGeometry.getIntersection(wall);
      if (this.templateGeometry.isOutside(wall) && intersections.length == 0) {
        continue;
      }
      switch (intersections.length) {
        case 1:
          let wallData;
          let oustidePoint;
          if (
            !this.templateGeometry.polygon.contains(
              wall.data.c[0],
              wall.data.c[1]
            )
          ) {
            oustidePoint = { x: wall.data.c[0], y: wall.data.c[1] };
          } else {
            oustidePoint = { x: wall.data.c[2], y: wall.data.c[3] };
          }
          wallData = {
            "c": [
                oustidePoint.x,
                oustidePoint.y,
                intersections[0].x,
                intersections[0].y,
              ],
            "move": 1,
            "sense": 1,
            "sound": 1,
            "dir": 0,
            "door": 0,
            "ds": 0,
            "flags": wall.data.flags,
        }

          this.wallsToDestroy.push(wall.id);
          this.wallsToCreate.push(wallData);

          break;
        case 2:
            const dist = TemplateGeometry.getDistance(intersections[0],{x:wall.data.c[0],y:wall.data.c[1]});
            const dist2 = TemplateGeometry.getDistance(intersections[1],{x:wall.data.c[0],y:wall.data.c[1]});
            let wallData1,wallData2;
            if(dist>dist2){
                wallData1 = {
                    "c": [
                        wall.data.c[0],
                        wall.data.c[1],
                        intersections[1].x,
                        intersections[1].y,
                      ],
                    "move": 1,
                    "sense": 1,
                    "sound": 1,
                    "dir": 0,
                    "door": 0,
                    "ds": 0,
                    "flags": wall.data.flags,
                }
                wallData2 = {
                    "c": [
                        wall.data.c[2],
                        wall.data.c[3],
                        intersections[0].x,
                        intersections[0].y,
                      ],
                    "move": 1,
                    "sense": 1,
                    "sound": 1,
                    "dir": 0,
                    "door": 0,
                    "ds": 0,
                    "flags": wall.data.flags,
                }
            }else{
                wallData1 = {
                    "c": [
                        wall.data.c[0],
                        wall.data.c[1],
                        intersections[0].x,
                        intersections[0].y,
                      ],
                    "move": 1,
                    "sense": 1,
                    "sound": 1,
                    "dir": 0,
                    "door": 0,
                    "ds": 0,
                    "flags": wall.data.flags,
                }
                wallData2 = {
                    "c": [
                        wall.data.c[2],
                        wall.data.c[3],
                        intersections[1].x,
                        intersections[1].y,
                      ],
                    "move": 1,
                    "sense": 1,
                    "sound": 1,
                    "dir": 0,
                    "door": 0,
                    "ds": 0,
                    "flags": wall.data.flags,
                }
            }
            this.wallsToDestroy.push(wall.id);
            this.wallsToCreate.push(wallData1);
            this.wallsToCreate.push(wallData2);

          break;
      }
    }
    return { toDestry: this.wallsToDestroy, toCreate: this.wallsToCreate };
  }

  async blast() {
    let walls = this.walls;
    await this.createWalls();
    await this.destroyWalls();
  }
}
