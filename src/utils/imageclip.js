import Konva from 'konva'

export default class knovaImgClip {
  stage
  layerImg
  layerShape

  constructor(config) {
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
    this.layerImg = new Konva.Layer()
    this.layerShape = new Konva.Layer()
  }
  image(img, width, height) {
    const imgs = new Konva.Image({
      x: 0,
      y: 0,
      image: img,
      width,
      height,
    });
    this.layerImg.add(imgs);
    this.stage.add(this.layerImg);
    this.clipRect()
  }
  drawImg(url, width, height) {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      this.image(img, width, height);
    }
  }
  clipRect() {
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      stroke: 'red',
      name: 'shape',
      type: 'rect',
      strokeWidth: 1,
      draggable: true,
    });
    this.layerShape.add(rect);
    this.stage.add(this.layerShape)
    // 添加矩形拖动事件
    // rect.on('dragstart', (e) => {
    //   const { attrs } = e.target;
    //   this.oldAttrs = JSON.parse(JSON.stringify(attrs))
    //   this.isTransform = true;
    //   console.log('rect drag start', this.isTransform);
      
    // })
    rect.on('dragend', (e) => {
      // this.isTransform = false;
      
      // setTimeout(() => {this.isTransform = false;}, 100)
      const { attrs } = e.target;
      console.log('rect draw end', attrs);
      // this.modificationRectInfo(attrs);
    });
  }
  clipImg() {
    // console.log(this.layerImg);
    // const group = new Konva.Group({
    //   clip: {
    //     x: 0,
    //     y: 0,
    //     width: 200,
    //     height: 100,
    //   },
    //   draggable: false,
    // });
    // this.layerShape.add(group)
    // this.stage.add(this.layerShape)
    // this.layerImg.destroyChildren()
    this.layerImg.clip({
      x: 0,
      Y: 0,
      width: 100,
      height: 100,
      scale: 10
    })
    
    console.log(this.layerImg);
  }
}