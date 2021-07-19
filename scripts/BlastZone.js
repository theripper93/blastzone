class TemplateGeometry {
  static getPolygon(template) {
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
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) {
      return null;
    }
    const ua = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    const ub = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
    const x = ua / denom;
    const y = ub / denom;
    return { x: x, y: y };
  }

  static getIntersection(wall, polygon) {
      const line1 = {
          x1:wall.data.c[0],
          y1:wall.data.c[1],
          x2:wall.data.c[2],
          y2:wall.data.c[3],
        };
        let intersections = [];
        for(let i=0; i<polygon.points.length-2; i+=2){
          const line2 = {
            x1:polygon.points[i],
            y1:polygon.points[i+1],
            x2:polygon.points[i+2],
            y2:polygon.points[i+3]
          }
          const intersection = TemplateGeometry.lineLineIntersection(line1, line2);
          if(intersection){
            intersections.push(intersection);
          }
        
        }
        return intersections;
  }

  static isInside(wall, polygon) {
      return polygon.contains(wall.data.c[0], wall.data.c[1]) && polygon.contains(wall.data.c[2], wall.data.c[3]);
  }

  static isOutside(wall, polygon) {
    return !polygon.contains(wall.data.c[0], wall.data.c[1]) && !polygon.contains(wall.data.c[2], wall.data.c[3]);
  }
}
