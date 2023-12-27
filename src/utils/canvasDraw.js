import Konva from 'konva'
import { generateId } from './generateId'
import EventDispatcher from './EventDispatcher'

const getPoint = (vertices, scale) => {
  const result = []
  vertices.forEach(item => {
    // console.log(item[0] / scale, Math.round(item[0] / scale))
    result.push(Math.round(item[0] / scale))
    result.push(Math.round(item[1] / scale))
  })
  return result
}
export default class CanvasDraw extends EventDispatcher {
  stage
  layerShape
  fixedLayer
  scale = 1
  fixedShapeColor = 'blue'
  fixedShapeName = 'fixedShape'
  asyncShapeName = 'asyncShape'
  createType = 'none'
  constructor(config) {
    super()
    this.init(config)
  }
  init(config) {
    console.log('init');
    this.stage = new Konva.Stage({
      container: document.getElementById(config.canvasId),
      width: config.width,
      height: config.height,
      draggable: false
    })
    this.layerShape = new Konva.Layer()
    this.fixedLayer = new Konva.Layer()
    // this.eventFun()
    this.drawLine()
  }
  polygon(points, id, stroke, name) {
    const poly = new Konva.Line({
      points,
      // fill: '#00D2FF',
      stroke,
      strokeWidth: 1,
      closed: true,
      name,
      id
    })
    if (name === this.fixedShapeName) {
      this.fixedLayer.add(poly)
    } else {
      this.layerShape.add(poly)
    }
  }
  text(payload) {
    const text = new Konva.Text({
      ...payload,
      fontSize: 18,
      fill: 'red',
      offsetX: 0,
      offsetY: 18,
      type: 'text'
    })
    this.layerShape.add(text)
  }
  text1(payload) {
    const text = new Konva.Text({
      ...payload,
      fontSize: 18,
      fill: 'red',
      offsetX: 0,
      offsetY: 0,
      type: 'text'
    })
    this.layerShape.add(text)
  }
  eventFun() {
    this.stage.on('click', () => {
      console.log('dblclickaaaaaaaaaa');
      // this.dispatchEvent('dblclick')
    })
  }
  drawShape(data) {
    if (this.stage) {
      this.layerShape.destroyChildren()
      // 这里判断固定的图形是否存在，如果存在就不绘制了，减少性能消耗
      const fixedShapeNum = this.stage.find(`.${this.fixedShapeName}`).length
      const id = generateId() + ''
      if (fixedShapeNum === 0) {
        // console.log('执行了')
        data.drawShape.forEach((item, index) => {
          const points = getPoint(item, this.scale)
          const fixedShapeId = 'fixed' + id + index
          this.polygon(points, fixedShapeId, this.fixedShapeColor, this.fixedShapeName)
        })
        this.stage.add(this.fixedLayer)
      }
      if (data.detectionShape) {
        // console.log(data.detectionShape)
        data.detectionShape.forEach((item, index) => {
          const points = getPoint(item.point, this.scale)
          const asyncShapeId = 'async' + id + index
          this.polygon(points, asyncShapeId, item.color, this.asyncShapeName)
          if (item.showText) {
            const textId = 'asyncText' + id + index
            this.text({
              id: textId,
              x: Math.round(item.textPoint.x / this.scale),
              y: Math.round(item.textPoint.y / this.scale),
              text: item.text
            })
            this.text1({
              id: textId,
              x: Math.round(item.textPoint.x / this.scale),
              y: Math.round(item.textPoint.y / this.scale),
              text: item.textScore
            })
            // console.log(points)
          }
        })
        this.stage.add(this.layerShape)
      }
    }
  }
  // drawLine() {}
  setScale(scale) {
    this.scale = scale
  }
  rebuild(config) {
    this.destroy()
    setTimeout(() => {
      this.init(config)
    }, 100)
  }
  destroy() {
    this.fixedLayer.destroyChildren()
    this.layerShape.destroyChildren()
    this.stage.destroy()
    this.stage = null
  }
  destroyFixedShape() {
    this.fixedLayer.destroyChildren()
  }
  drawPolygon() {
    console.log(111, this.stage);
    const initLine = {
      id: generateId() + '',
      type: "polygon",
      stroke: "black",
      strokeWidth: 5,
      fill: "red",
    };
    let polygonShape = new Konva.Line(initLine)
    // 这个是辅助线
    let auxiliaryLine = new Konva.Line({
      points: [],
      stroke: "green",
      strokeWidth: 2,
      lineJoin: "round",
      dash: [10],
    });
    let path = []
    const onMousedown = ({evt}) => {
      // if ()
      if (!polygonShape) { return }
      const x = evt.offsetX;
      const y = evt.offsetY;
      // 判断有没有闭合，方便操作，当点击到起始位置的一定范围内即视为闭合
      if (Math.abs(path?.[0] - x) <= 5 && Math.abs(path?.[1] - y) <= 5) {
        console.log(333);
        auxiliaryLine.destroy();
        polygonShape.destroy();
        polygonShape = new Konva.Line(initLine)
        auxiliaryLine = new Konva.Line({
          points: [],
          stroke: "green",
          strokeWidth: 2,
          lineJoin: "round",
          dash: [10],
        });
        this.polygon(path, generateId() + '', 'blue', this.fixedShapeName)
        path = []
        return;
      }
      path.push(...[x, y]);
      polygonShape.setAttrs({ points: path });
      // path只有2个位置(一对x,y)就代表第一次插入，把图形放到 layer 里
      if (path.length === 2) {
        this.fixedLayer.add(auxiliaryLine);
        this.fixedLayer.add(polygonShape);
      }
      this.stage.add(this.fixedLayer)
    }
    const onMouseMove = ({evt}) => {
      const closePathX = path[0];
      const closePathY = path[1];
      const lastPathX = path[path.length - 2];
      const lastPathY = path[path.length - 1];
      const x = evt.offsetX;
      const y = evt.offsetY;

      if (!lastPathX || !lastPathY) return;
      //做个吸附效果，如果鼠标当前位置非常接近闭合点，把线移动过去
      if (Math.abs(closePathX - x) <= 5 && Math.abs(closePathY - y) <= 5) {
        auxiliaryLine.setAttrs({
          points: [lastPathX, lastPathY, closePathX, closePathY],
        });
      } else {
        //  辅助线的第一个点永远是 path 的最后一个位置，第二个点是当前鼠标所在的点
        auxiliaryLine.setAttrs({
          points: [lastPathX, lastPathY, x, y],
        });
      }
    }
    this.stage.on('mousedown', onMousedown)
    this.stage.on("mousemove", onMouseMove);
  }
  drawLine() {
    const initLine = {
      id: generateId() + '',
      type: "polygon",
      stroke: "black",
      strokeWidth: 5,
      fill: "red",
    };
    let polygonShape = new Konva.Line(initLine)
    // 这个是辅助线
    let auxiliaryLine = new Konva.Line({
      points: [],
      stroke: "green",
      strokeWidth: 2,
      lineJoin: "round",
      dash: [10],
    });
    let path = []
    const onMousedown = ({evt}) => {
      // if ()
      if (!polygonShape) { return }
      console.log(222);
      const x = evt.offsetX;
      const y = evt.offsetY;
      path.push(...[x, y]);
      // 判断有没有闭合，方便操作，当点击到起始位置的一定范围内即视为闭合
      if (path.length === 4) {
        console.log(333);
        auxiliaryLine.destroy();
        polygonShape.destroy();
        polygonShape = new Konva.Line(initLine)
        auxiliaryLine = new Konva.Line({
          points: [],
          stroke: "green",
          strokeWidth: 2,
          lineJoin: "round",
          dash: [10],
        });
        // console.log();
        // path.push(...[x, y]);
        this.polygon(path, generateId() + '', 'blue', this.fixedShapeName)
        path = []
        return;
      }
      console.log(444);
      polygonShape.setAttrs({ points: path });
      // path只有2个位置(一对x,y)就代表第一次插入，把图形放到 layer 里
      if (path.length === 2) {
        this.fixedLayer.add(auxiliaryLine);
        this.fixedLayer.add(polygonShape);
      }
      this.stage.add(this.fixedLayer)
    }
    const onMouseMove = ({evt}) => {
      const lastPathX = path[path.length - 2];
      const lastPathY = path[path.length - 1];
      const x = evt.offsetX;
      const y = evt.offsetY;

      if (!lastPathX || !lastPathY) return;
      auxiliaryLine.setAttrs({
        points: [lastPathX, lastPathY, x, y],
      });
    }
    this.stage.on('mousedown', onMousedown)
    this.stage.on("mousemove", onMouseMove);
  }
}
