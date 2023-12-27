<!--
 * @Descripttion: 
 * @version: 
 * @Author: yangxing
 * @Date: 2022-07-14 11:49:34
 * @LastEditors: yangxing
 * @LastEditTime: 2022-08-13 15:22:02
-->

<template>
  <div style="width: 100%;height: 100%;">
    <!-- <el-button-group>
    </el-button-group> -->
    <div id="map" ref="map" style="width: 100%;height: 100%;"></div>
    <button size="mini" @click="selectTool(0)">矩形</button>
    <button size="mini" @click="selectTool(1)">多边形</button>
  </div>
</template>

<script>
import Konva from "konva";
export default {
  name: "MyKonva",
  data() {
    return {
      rect: false,
      poly: false,
      stage: null,
      layer: null,
      shape: null,
      image: { src: null },
      currentTool: "",
      toolObject: [
        {
          name: "rect",
          type: "rect",
          /* 矩形颜色 */ color: "#75fb4c",
          /* 边框颜色 */ lineColor: "#75fb4c",
          /* 顶点颜色 */ anchorColor: "green",
        },
        {
          name: "poly",
          type: "poly",
          /* 矩形颜色 */ color: "#E63F00",
          /* 边框颜色 */ lineColor: "#E63F00 ",
          /* 顶点颜色 */ anchorColor: "red",
        },
      ],
      drawing: true, //一开始不能绘画
      currentDrawingShape: null, //现在绘画的图形
      rectPoints: [], //存储矩形的各个顶点的数组
      polygonPoints: [], //存储绘画多边形各个顶点的数组
      stageWidth: 0, //舞台宽
      stageHeight: 0, //舞台高
      scale: 1, //窗口变化的缩放比例
      currentDel: null, //删除对象
      currentCancel: null, //删除对象
      mouseOffsetX: 0,
      mouseOffsetY: 0,
      mouseOffsetList: [],
      label: "label", //标注
    };
  },
  methods: {
    //选择工具
    selectTool(index) {
      //如果还在绘画，但选择工具，则将正在绘画的图形删除
      if (this.drawing) {
        this.currentDrawingShape.getParent().destroy();
        this.rectPoints = [];
        this.polygonPoints = [];
        this.drawing = false;
        this.layer.draw();
      }
      this.currentTool = this.toolObject[index];
    },
    //重新调整画布
    resizeStage() {
      this.scale = this.$refs.map.clientWidth / this.stageWidth;
      this.stage.width(this.stageWidth * this.scale);
      this.stage.height(this.stageHeight * this.scale);
      this.stage.scale({ x: this.scale, y: this.scale });
      //维持原来大小
      this.layer.find("Circle").forEach((element) => {
        element.setAttr("radius", 5 / this.scale / this.layer.scaleX());
      });
      this.layer.find("Label").forEach((element) => {
        element.getText().setAttrs({
          fontSize: 16 / this.scale / this.layer.scaleX(),
          padding: 1 / this.scale / this.layer.scaleX(),
        });
      });
      this.stage.draw();
    },
    /**
     *初始化konva舞台
     */
    initKonvaStage() {
      //1实例化stage层
      this.stageWidth = this.$refs.map.clientWidth;
      this.stageHeight = this.$refs.map.clientHeight;
      this.stage = new Konva.Stage({
        container: "map",
        width: this.stageWidth,
        height: this.stageHeight,
        ignoreStroke: true,
      });
      this.stage.container().style.cursor = "crosshair";
      var vc_this = this;
      //2实例化layer层
      this.layer = new Konva.Layer();
      //3添加layer层
      this.stage.add(this.layer);
      var imageObj = new Image();
      imageObj.onload = function () {
        vc_this.shape = new Konva.Image({
          image: imageObj,
          width: vc_this.stageWidth,
          height: vc_this.stageHeight,
        });
        vc_this.layer.add(vc_this.shape);
      };
      imageObj.src = 'http://localhost:3000/static/brick_diffuse.jpg';
      //给***舞台***绑定事件
      this.stageBindEvent(this);
    },
    /**
     * 舞台绑定的事件
     * @param vc_this
     */
    stageBindEvent(vc_this) {
      //鼠标按下
      this.stage.on("mousedown", (e) => {
        //鼠标左键开始
        if (e.evt.button == 0) {
          // if (e.target === vc_this.stage) {
          //   // vc_this.$message({
          //   //   message: "请选择图片！",
          //   //   type: "warning",
          //   //   center: true,
          //   //   duration: 1000,
          //   // });
          //   return;
          // }
          //图形起始点只能在图片层上
          if (e.target === vc_this.shape) {
            //开始初始绘画
            vc_this.stageMousedown(vc_this.currentTool, e);
            return;
          }
          //允许后续点绘画在其他图形上
          if (vc_this.drawing) {
            vc_this.stageMousedown(vc_this.currentTool, e);
            return;
          }
        } else if (e.evt.button == 2) {
          if (vc_this.polygonPoints.length != 0) {
            //最好使用konva提供的鼠标xy点坐标
            var mousePos = vc_this.stage.getPointerPosition();
            //考虑鼠标缩放
            var x =
                (mousePos.x / vc_this.scale - vc_this.layer.getAttr("x")) /
                vc_this.layer.scaleX(),
              y =
                (mousePos.y / vc_this.scale - vc_this.layer.getAttr("y")) /
                vc_this.layer.scaleY();
            //group继续添加多边形的点
            vc_this.drawCircle(
              vc_this.currentTool,
              x,
              y,
              vc_this.currentDrawingShape.getParent(),
              vc_this.polygonPoints
            );
            vc_this.polygonPoints.push(x);
            vc_this.polygonPoints.push(y);
            //绘画多边形
            vc_this.currentDrawingShape.setAttr("points", vc_this.polygonPoints);
            //group继续添加多边形的边
            vc_this.currentDrawingShape
              .getParent()
              .getChildren((node) => {
                return node.getAttr("name") === vc_this.currentTool.name + "line";
              })[0]
              .setAttr("points", vc_this.polygonPoints);
            //判断是否是只有两个点的多边形，如果起点和终点相同，不允许绘画
            if (
              vc_this.currentDrawingShape.points().length == 2 ||
              vc_this.currentDrawingShape.points().length == 4
            ) {
              vc_this.drawing = false;
              vc_this.currentDrawingShape.getParent().destroy();
              vc_this.polygonPoints = [];
              console.log('顶点数必须大于2个！');
              // vc_this.$message({
              //   message: "顶点数必须大于2个！",
              //   type: "warning",
              //   center: true,
              //   duration: 1000,
              // });
              return;
            }
            e.cancelBubble = true;
            this.drawing = false;
          }
        }
      });
      //鼠标移动
      this.stage.on("mousemove", (e) => {
        if (vc_this.currentTool && vc_this.drawing) {
          //绘画中
          vc_this.stageMousemove(vc_this.currentTool);
        }
      });
      //鼠标放开
      vc_this.stage.on("mouseup", (e) => {
        if (e.evt.button == 0) {
          if (vc_this.currentTool && vc_this.drawing) {
            vc_this.stageMouseup(vc_this.currentTool, e);
          }
        } else if (e.evt.button == 2) {
          if (
            vc_this.currentTool &&
            !vc_this.drawing &&
            vc_this.polygonPoints.length != 0
          ) {
            vc_this.stageMouseup(vc_this.currentTool, e);
          }
        }
      });
      //鼠标滚轮事件
      vc_this.stage.on("wheel", (e) => {
        if (vc_this.shape) {
          var step = 0.03; // 每次缩放的比例
          var mousePos = vc_this.stage.getPointerPosition();
          var x = mousePos.x / vc_this.scale,
            y = mousePos.y / vc_this.scale;
          if (e.evt.wheelDelta > 0) {
            vc_this.mouseOffsetX = x * step;
            vc_this.mouseOffsetY = y * step;
            // 放大
            vc_this.layer.scaleX(vc_this.layer.scaleX() + step);
            vc_this.layer.scaleY(vc_this.layer.scaleY() + step);
            vc_this.layer.move({ x: -vc_this.mouseOffsetX, y: -vc_this.mouseOffsetY });
            vc_this.mouseOffsetList.push(vc_this.mouseOffsetX, vc_this.mouseOffsetY);
            //维持原来大小
            vc_this.layer.find("Circle").forEach((element) => {
              element.setAttr("radius", 5 / vc_this.scale / vc_this.layer.scaleX());
            });
            vc_this.layer.find("Label").forEach((element) => {
              element.getText().setAttrs({
                fontSize: 16 / vc_this.scale / vc_this.layer.scaleX(),
                padding: 1 / vc_this.scale / vc_this.layer.scaleX(),
              });
            });
            vc_this.stage.draw();
          } else if (e.evt.wheelDelta < 0 && vc_this.mouseOffsetList.length != 0) {
            vc_this.layer.scaleX(vc_this.layer.scaleX() - step);
            vc_this.layer.scaleY(vc_this.layer.scaleY() - step);
            vc_this.mouseOffsetY = vc_this.mouseOffsetList.pop();
            vc_this.mouseOffsetX = vc_this.mouseOffsetList.pop();
            vc_this.layer.move({ x: vc_this.mouseOffsetX, y: vc_this.mouseOffsetY });
            //维持原来大小
            vc_this.layer.find("Circle").forEach((element) => {
              element.setAttr("radius", 5 / vc_this.scale / vc_this.layer.scaleX());
            });
            vc_this.layer.find("Label").forEach((element) => {
              element.getText().setAttrs({
                fontSize: 16 / vc_this.scale / vc_this.layer.scaleX(),
                padding: 1 / vc_this.scale / vc_this.layer.scaleX(),
              });
            });
            vc_this.stage.draw();
          }
        }
      });
      //舞台快捷键
      var container = this.stage.container();
      container.tabIndex = 1;
      container.focus();
      container.addEventListener("keydown", (e) => {
        //删除的快捷键
        if (e.keyCode === 46) {
          if (this.currentDel) {
            this.currentDel.destroy();
            this.currentDel = null;
            // this.$message({
            //   message: "删除成功！",
            //   type: "success",
            //   center: true,
            //   duration: 1000,
            // });
          }
        }
        vc_this.stage.container().style.cursor = "crosshair";
        e.preventDefault();
        vc_this.layer.draw();
      });
      container.addEventListener("keydown", (e) => {
        //撤销的快捷键(ctrl+z)
        if (e.ctrlKey == true && e.keyCode == 90) {
          switch (this.currentTool.type) {
            case "rect":
              //正在绘画，直接删除group
              if (this.drawing) {
                this.currentDrawingShape.getParent().destroy();
                this.rectPoints = [];
                this.drawing = false;
              } else {
                //绘画完成，直接删除group
                this.currentCancel.destroy();
                this.rectPoints = [];
                this.drawing = false;
              }
              break;
            case "poly":
              //删除点
              var y = this.polygonPoints.pop();
              var x = this.polygonPoints.pop();
              //如果撤销的是第一个点，直接删除group
              if (this.drawing && this.polygonPoints.length == 0) {
                this.currentCancel.destroy();
                this.drawing = false;
              } //如果是已绘画完的多边形
              else if (!this.drawing && this.polygonPoints.length == 0) {
                if (this.currentCancel) {
                  this.currentCancel.destroy();
                  this.currentCancel = null;
                  // this.$message({
                  //   message: "删除成功！",
                  //   type: "success",
                  //   center: true,
                  //   duration: 1000,
                  // });
                }
              } else {
                this.currentCancel
                  .getChildren((node) => {
                    return node.x() == x && node.y() == y;
                  })[0]
                  .destroy();
                //重新绘画多边形
                //最好使用konva提供的鼠标xy点坐标
                var mousePos = this.stage.getPointerPosition();
                //考虑鼠标缩放
                var x =
                    (mousePos.x / this.scale - this.layer.getAttr("x")) /
                    this.layer.scaleX(),
                  y =
                    (mousePos.y / this.scale - this.layer.getAttr("y")) /
                    this.layer.scaleY();
                var tempPoints = this.polygonPoints.concat();
                tempPoints.push(x);
                tempPoints.push(y);
                //修改多边形的点
                this.currentCancel
                  .find("." + this.currentTool.name + "poly")[0]
                  .setAttr("points", tempPoints);
                //重新绘画多边形的边
                this.currentCancel
                  .find("." + this.currentTool.name + "line")[0]
                  .setAttr("points", tempPoints);
              }
              break;
          }
        }
        vc_this.stage.container().style.cursor = "crosshair";
        e.preventDefault();
        vc_this.layer.draw();
      });
    },
    /**
     * 在舞台上鼠标点下发生的事件
     * @param currentTool 当前选择的工具
     * @param e 传入的event对象
     */
    stageMousedown(currentTool, e) {
      if (currentTool.type == null) {
        // this.$message({
        //   message: "请选择标注工具！",
        //   type: "warning",
        //   center: true,
        //   duration: 1000,
        // });
        return;
      }
      switch (currentTool.type) {
        case "rect":
          //最好使用konva提供的鼠标xy点坐标
          var mousePos = this.stage.getPointerPosition();
          //考虑鼠标缩放
          var x =
              (mousePos.x / this.scale - this.layer.getAttr("x")) / this.layer.scaleX(),
            y = (mousePos.y / this.scale - this.layer.getAttr("y")) / this.layer.scaleY();
          //拖拽组
          var group = new Konva.Group({
            name: currentTool.name + "group",
            draggable: true,
          });
          //添加矩形的初始点
          var rectTopLeft = this.drawCircle(currentTool, x, y, group, this.rectPoints);
          //修改矩形顶点名称
          rectTopLeft.name("rectTopLeft");
          //绘制矩形
          this.drawRect(currentTool, x, y, group);
          //添加矩形的边
          this.rectPoints.push(x);
          this.rectPoints.push(y);
          this.drawLine(currentTool, this.rectPoints, group);
          this.layer.add(group);
          this.currentCancel = group;
          this.layer.draw();
          //使所有顶点在顶层显示
          this.stage.find("Circle").forEach((element) => {
            element.moveToTop();
          });
          break;
        case "poly":
          //如果数组长度小于2，初始化多边形和顶点，使它们成为一组,否则什么都不做
          if (this.polygonPoints.length < 2) {
            //最好使用konva提供的鼠标xy点坐标
            var mousePos = this.stage.getPointerPosition();
            //考虑鼠标缩放
            var x =
                (mousePos.x / this.scale - this.layer.getAttr("x")) / this.layer.scaleX(),
              y =
                (mousePos.y / this.scale - this.layer.getAttr("y")) / this.layer.scaleY();
            //拖拽组
            var group = new Konva.Group({
              name: currentTool.name + "group",
              draggable: false,
            });
            this.polygonPoints = [x, y];
            //添加多边形的点
            this.drawCircle(currentTool, x, y, group, this.polygonPoints);

            //绘画多边形
            this.drawPolygon(currentTool, this.polygonPoints, group);
            //添加多边形的边
            this.drawLine(currentTool, this.polygonPoints, group);
            this.layer.add(group);
            this.currentCancel = group;
            //添加标签
            var label = this.drawLabel(currentTool, x, y, group, this.label);
            label.hide();
            //使所有顶点在顶层显示
            this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            this.layer.draw();
          } //多边形增加顶点
          else {
            //最好使用konva提供的鼠标xy点坐标
            var mousePos = this.stage.getPointerPosition();
            //考虑鼠标缩放
            var x =
                (mousePos.x / this.scale - this.layer.getAttr("x")) / this.layer.scaleX(),
              y =
                (mousePos.y / this.scale - this.layer.getAttr("y")) / this.layer.scaleY();
            //group继续添加多边形的点
            this.drawCircle(
              currentTool,
              x,
              y,
              this.currentDrawingShape.getParent(),
              this.polygonPoints
            );
            this.polygonPoints.push(x);
            this.polygonPoints.push(y);
            //绘画多边形
            this.currentDrawingShape.setAttr("points", this.polygonPoints);
            //group继续添加多边形的边
            this.currentDrawingShape
              .getParent()
              .getChildren((node) => {
                return node.getAttr("name") === currentTool.name + "line";
              })[0]
              .setAttr("points", this.polygonPoints);
            //使所有顶点在顶层显示
            this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            this.layer.draw();
          }
          break;
        default:
          break;
      }
      this.drawing = true;
    },
    /**
     * 鼠标在舞台上移动事件
     * @param currentTool 当前选择的工具
     * @param e 传入的event对象
     */
    stageMousemove(currentTool) {
      switch (currentTool.type) {
        case "rect":
          this.stage.container().style.cursor = "crosshair";
          //矩形初始化，鼠标移动操作
          //最好使用konva提供的鼠标xy点坐标
          var mousePos = this.stage.getPointerPosition();
          //考虑鼠标缩放
          var x =
              (mousePos.x / this.scale - this.layer.getAttr("x")) / this.layer.scaleX(),
            y = (mousePos.y / this.scale - this.layer.getAttr("y")) / this.layer.scaleY();
          var point1 = [this.rectPoints[0], this.rectPoints[1]];
          var point2 = [x, this.rectPoints[1]];
          var point3 = [x, y];
          var point4 = [this.rectPoints[0], y];
          //如果矩形顶点不足创建顶点
          if (this.rectPoints.length < 8) {
            this.rectPoints = point1.concat(point2, point3, point4);
            //删除第一个顶点
            this.currentDrawingShape
              .getParent()
              .getChildren((element) => {
                return element.getAttr("name") === "rectTopLeft";
              })[0]
              .destroy();
            var rectTopLeft = this.drawCircle(
              currentTool,
              point1[0],
              point1[1],
              this.currentDrawingShape.getParent(),
              this.rectPoints
            );
            rectTopLeft.name("rectTopLeft");
            //添加标签
            var label = this.drawLabel(
              currentTool,
              point1[0],
              point1[1],
              this.currentDrawingShape.getParent(),
              this.label
            );
            label.hide();
            var rectTopRight = this.drawCircle(
              currentTool,
              point2[0],
              point2[1],
              this.currentDrawingShape.getParent(),
              this.rectPoints
            );
            rectTopRight.name("rectTopRight");
            var rectBottomRight = this.drawCircle(
              currentTool,
              point3[0],
              point3[1],
              this.currentDrawingShape.getParent(),
              this.rectPoints
            );
            rectBottomRight.name("rectBottomRight");
            var rectBottomLeft = this.drawCircle(
              currentTool,
              point4[0],
              point4[1],
              this.currentDrawingShape.getParent(),
              this.rectPoints
            );
            rectBottomLeft.name("rectBottomLeft");
          }
          //修改矩形的顶点
          this.rectPoints[2] = point2[0];
          this.rectPoints[3] = point2[1];

          this.rectPoints[4] = point3[0];
          this.rectPoints[5] = point3[1];

          this.rectPoints[6] = point4[0];
          this.rectPoints[7] = point4[1];
          this.currentDrawingShape
            .getParent()
            .getChildren((node) => {
              return node.getAttr("name") === "rectTopRight";
            })[0]
            .setAttrs({
              x: point2[0],
              y: point2[1],
            });
          this.currentDrawingShape
            .getParent()
            .getChildren((node) => {
              return node.getAttr("name") === "rectBottomRight";
            })[0]
            .setAttrs({
              x: point3[0],
              y: point3[1],
            });
          this.currentDrawingShape
            .getParent()
            .getChildren((node) => {
              return node.getAttr("name") === "rectBottomLeft";
            })[0]
            .setAttrs({
              x: point4[0],
              y: point4[1],
            });
          //添加矩形的边
          this.currentDrawingShape
            .getParent()
            .getChildren((node) => {
              return node.getAttr("name") === currentTool.name + "line";
            })[0]
            .setAttr("points", this.rectPoints);
          this.currentDrawingShape.setAttrs({
            width: x - this.rectPoints[0],
            height: y - this.rectPoints[1],
          });
          //使所有顶点在顶层显示
          this.stage.find("Circle").forEach((element) => {
            element.moveToTop();
          });
          break;
        case "poly":
          this.stage.container().style.cursor = "crosshair";
          //多边形初始化后，如果数组长度大于2，鼠标移动时，实时更新下一个点
          if (this.polygonPoints.length >= 2) {
            var mousePos = this.stage.getPointerPosition();
            var x =
                (mousePos.x / this.scale - this.layer.getAttr("x")) / this.layer.scaleX(),
              y =
                (mousePos.y / this.scale - this.layer.getAttr("y")) / this.layer.scaleY();
            var tempPoints = this.polygonPoints.concat([]);
            tempPoints.push(x);
            tempPoints.push(y);
            //更新多边形的线
            this.currentDrawingShape
              .getParent()
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "line";
              })[0]
              .setAttr("points", tempPoints);
            //更新多边形
            this.currentDrawingShape.setAttr("points", tempPoints);
            //使所有顶点在顶层显示
            this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
          }
          break;
        default:
          break;
      }
      this.layer.draw();
    },
    /**
     * 鼠标在舞台弹起
     * @param currentTool 当前选择的工具
     * @param e 传入的event对象
     */
    stageMouseup(currentTool, e) {
      switch (currentTool.type) {
        case "rect":
          this.currentDrawingShape = this.currentDrawingShape.getParent();
          if (
            this.currentDrawingShape.getChildren((element) => {
              return element.getClassName() === "Circle";
            }).length < 4
          ) {
            this.drawing = false;
            this.currentDrawingShape.destroy();
            this.rectPoints = [];
            // this.$message({
            //   message: "矩形过小！",
            //   type: "warning",
            //   center: true,
            //   duration: 1000,
            // });
            return;
          } else {
            //显示标签
            this.currentDrawingShape
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "label";
              })[0]
              .show();
            this.rectPoints = [];
            this.drawing = false;
            //使所有顶点在顶层显示
            this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
          }
          break;
        case "poly":
          if (e.evt.button == 2) {
            this.currentDrawingShape = this.currentDrawingShape.getParent();
            //显示标签
            this.currentDrawingShape
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "label";
              })[0]
              .show();
            //形成多边形直接发送数据
            // this.$message({
            //   message: "成功！",
            //   type: "success",
            //   center: true,
            //   duration: 1000,
            // });
            //右键弹起
            this.polygonPoints = [];
            //使所有顶点在顶层显示
            this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
          }
          break;
        default:
          break;
      }
      this.layer.draw();
    },
    /**
     * 多边形圆形
     * @param //x x坐标
     * @param //y y坐标
     */
    drawCircle(currentTool, x, y, group, shapePoints) {
      var vc_this = this;
      var circle = new Konva.Circle({
        name: currentTool.name + "circle",
        x: x,
        y: y,
        radius: 5 / this.scale / this.layer.scaleX(),
        visible: true, //是否显示
        fill: currentTool.anchorColor,
        stroke: currentTool.anchorColor,
        draggable: false,
        strokeWidth: 0.5,
        strokeScaleEnabled: false,
        //增加点击区域
        hitStrokeWidth: 8 / this.scale / this.layer.scaleX(),
        //设置拖动区域，不能超过舞台大小
        dragBoundFunc: function (pos) {
          //左上角
          if (pos.x < 0 && pos.y < 0) {
            return {
              x: 0,
              y: 0,
            };
          } //左侧
          else if (pos.x <= 0 && 0 <= pos.y && pos.y <= vc_this.stage.height()) {
            return {
              x: 0,
              y: pos.y,
            };
          }
          //左下角
          else if (pos.x < 0 && pos.y > vc_this.stage.height()) {
            return {
              x: 0,
              y: vc_this.stage.height(),
            };
          } //下侧
          else if (
            0 <= pos.x &&
            pos.x <= vc_this.stage.width() &&
            pos.y > vc_this.stage.height()
          ) {
            return {
              x: pos.x,
              y: vc_this.stage.height(),
            };
          } //右下角
          else if (pos.x > vc_this.stage.width() && pos.y > vc_this.stage.height()) {
            return {
              x: vc_this.stage.width(),
              y: vc_this.stage.height(),
            };
          }
          //右侧
          else if (
            pos.x > vc_this.stage.width() &&
            0 <= pos.y &&
            pos.y <= vc_this.stage.height()
          ) {
            return {
              x: vc_this.stage.width(),
              y: pos.y,
            };
          }
          //右上角
          else if (pos.x > vc_this.stage.width() && pos.y < 0) {
            return {
              x: vc_this.stage.width(),
              y: 0,
            };
          } //上侧
          else if (0 <= pos.x && pos.x <= vc_this.stage.width() && pos.y < 0) {
            return {
              x: pos.x,
              y: 0,
            };
          }
        },
      });
      group.add(circle);
      var xChange, yChange;
      circle.on("mouseover", (e) => {
        vc_this.stage.container().style.cursor = "pointer";
      });
      circle.on("mousedown", (e) => {
        if (!vc_this.drawing) {
          circle.draggable(true);
          //将现在绘画的对象改为group
          vc_this.currentDrawingShape = circle.getParent();
        } else {
          circle.draggable(false);
        }
        e.cancelBubble = true;
      });
      circle.on("mouseleave", (e) => {
        vc_this.stage.container().style.cursor = "crosshair";
      });
      circle.on("dragstart", (e) => {
        switch (currentTool.type) {
          case "rect":
            vc_this.currentDrawingShape = circle.getParent();
            break;
          case "poly":
            //查找拖拽了多边形的哪个点
            for (var i = 0; i < shapePoints.length; i += 2) {
              if (
                circle.getAttr("x") == shapePoints[i] &&
                circle.getAttr("y") == shapePoints[i + 1]
              ) {
                xChange = i;
                yChange = i + 1;
                break;
              }
            }
            break;
          default:
            break;
        }
      });
      circle.on("dragmove", (e) => {
        switch (currentTool.type) {
          case "rect":
            //查找拖拽了多边形的哪个点
            var circleName = circle.name();
            //修改点位置
            var anchorX = circle.getX();
            var anchorY = circle.getY();
            switch (circleName) {
              case "rectTopLeft":
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectTopRight";
                  })[0]
                  .y(anchorY);
                //修改线
                shapePoints[3] = anchorY;
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectBottomLeft";
                  })[0]
                  .x(anchorX);
                shapePoints[6] = anchorX;
                //更改拖拽点的位置来改变线段
                shapePoints[0] = anchorX;
                shapePoints[1] = anchorY;
                break;
              case "rectTopRight":
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectTopLeft";
                  })[0]
                  .y(anchorY);
                shapePoints[1] = anchorY;
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectBottomRight";
                  })[0]
                  .x(anchorX);
                shapePoints[4] = anchorX;
                //更改拖拽点的位置来改变线段
                shapePoints[2] = anchorX;
                shapePoints[3] = anchorY;
                break;
              case "rectBottomRight":
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectBottomLeft";
                  })[0]
                  .y(anchorY);
                shapePoints[7] = anchorY;
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectTopRight";
                  })[0]
                  .x(anchorX);
                shapePoints[2] = anchorX;
                //更改拖拽点的位置来改变线段
                shapePoints[4] = anchorX;
                shapePoints[5] = anchorY;
                break;
              case "rectBottomLeft":
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectBottomRight";
                  })[0]
                  .y(anchorY);
                shapePoints[5] = anchorY;
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectTopLeft";
                  })[0]
                  .x(anchorX);
                shapePoints[0] = anchorX;
                //更改拖拽点的位置来改变线段
                shapePoints[6] = anchorX;
                shapePoints[7] = anchorY;
                break;
            }
            //隐藏label
            vc_this.currentDrawingShape
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "label";
              })[0]
              .hide();
            //修改矩形位置和大小
            vc_this.currentDrawingShape
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "rect";
              })[0]
              .position(
                vc_this.currentDrawingShape
                  .getChildren((element) => {
                    return element.getAttr("name") === "rectTopLeft";
                  })[0]
                  .position()
              );
            var width =
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === "rectTopRight";
                })[0]
                .getX() -
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === "rectTopLeft";
                })[0]
                .getX();
            var height =
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === "rectBottomLeft";
                })[0]
                .getY() -
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === "rectTopLeft";
                })[0]
                .getY();
            if (width && height) {
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === currentTool.name + "rect";
                })[0]
                .width(width);
              vc_this.currentDrawingShape
                .getChildren((element) => {
                  return element.getAttr("name") === currentTool.name + "rect";
                })[0]
                .height(height);
            }
            break;
          case "poly":
            //隐藏label
            vc_this.currentDrawingShape
              .getChildren((element) => {
                return element.getAttr("name") === currentTool.name + "label";
              })[0]
              .hide();
            var x = circle.x();
            var y = circle.y();
            //更改拖拽点的位置
            shapePoints[xChange] = x;
            shapePoints[yChange] = y;
            break;
          default:
            break;
        }
      });
      circle.on("dragend", (e) => {
        switch (currentTool.type) {
          case "rect":
            //修改标签位置
            var rect = vc_this.currentDrawingShape.getChildren((node) => {
              return node.getAttr("name") === currentTool.name + "rect";
            })[0];
            var label = vc_this.currentDrawingShape.getChildren((node) => {
              return node.getAttr("name") === currentTool.name + "label";
            })[0];
            label.setAttrs({
              x:
                (rect.getClientRect().x / vc_this.scale - vc_this.layer.getAttr("x")) /
                vc_this.layer.scaleX(),
              y:
                (rect.getClientRect().y / vc_this.scale - vc_this.layer.getAttr("y")) /
                vc_this.layer.scaleX(),
              visible: true,
            });
            //使所有顶点在顶层显示
            vc_this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            circle.draggable(false);
            break;
          case "poly":
            //修改标签位置
            var poly = vc_this.currentDrawingShape.getChildren((node) => {
              return node.getAttr("name") === currentTool.name + "poly";
            })[0];
            var label = vc_this.currentDrawingShape.getChildren((node) => {
              return node.getAttr("name") === currentTool.name + "label";
            })[0];
            label.setAttrs({
              x: poly.points()[0],
              y: poly.points()[1],
              visible: true,
            });
            //使所有顶点在顶层显示
            vc_this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            circle.draggable(false);
            break;
          default:
            break;
        }
        // vc_this.$message({
        //   message: "修改成功！",
        //   type: "success",
        //   center: true,
        //   duration: 1000,
        // });
        e.cancelBubble = true;
      });
      return circle;
    },
    drawLabel(currentTool, x, y, group, labelText) {
      var label = new Konva.Label({
        x: x,
        y: y,
        name: currentTool.name + "label",
        visible: true,
        opacity: 1,
      });
      var tag = new Konva.Tag({
        fill: currentTool.color,
      });
      var text = new Konva.Text({
        text: labelText,
        fontFamily: "Calibri",
        fontSize: 16 / this.scale / this.layer.scaleX(),
        padding: 1 / this.scale / this.layer.scaleX(),
        fill: "#fff",
      });
      label.add(tag);
      label.add(text);
      group.add(label);
      return label;
    },
    /**
     * 线
     * @param //points 坐标数组
     */
    drawLine(currentTool, points, group) {
      var line = new Konva.Line({
        name: currentTool.name + "line",
        points: points,
        stroke: currentTool.lineColor,
        strokeWidth: 1,
        visible: true,
        draggable: false,
        closed: true,
        strokeScaleEnabled: false,
        opacity: 1, //透明度
      });
      group.add(line);
      return line;
    },
    /**
         *多边形
          @param currentTool
         * @param points 多边形绘画的各个顶点，类型数组
         */
    drawPolygon(currentTool, points, group) {
      console.log('多边形绘制');
      var poly = new Konva.Line({
        name: currentTool.name + "poly",
        points: points,
        /*  fill: currentTool.color, */
        stroke: currentTool.color,
        strokeWidth: 1,
        draggable: false,
        opacity: 0.5,
        lineCap: "round",
        lineJoin: "round",
        closed: true,
        strokeScaleEnabled: false,
      });
      this.currentDrawingShape = poly;
      group.add(poly);
      var vc_this = this;
      poly.getParent().on("mouseleave", (e) => {
        vc_this.stage.container().style.cursor = "crosshair";
      });
      poly.getParent().on("mousedown", (e) => {
        if (e.evt.button == 0) {
          //绘画结束
          if (!vc_this.drawing) {
            vc_this.stage.container().style.cursor = "move";
            //设置现在绘画节点的对象为该多边形和顶点的组
            vc_this.currentDrawingShape = poly.getParent();
            // 如果要让顶点和多边形一起拖拽，必须设置，多边形不能被拖拽
            poly.setAttr("draggable", false);
            poly.getParent().setAttr("draggable", true);
            //使所有顶点在顶层显示
            vc_this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            //添加删除撤销对象
            this.currentDel = vc_this.currentDrawingShape;
            this.currentCancel = vc_this.currentDrawingShape;
            vc_this.layer.draw();
          } else {
            vc_this.stage.container().style.cursor = "crosshair";
            poly.getParent().setAttr("draggable", false);
          }
        }
      });
      poly.getParent().on("dragend", (e) => {
        if (currentTool.name === vc_this.toolObject[1].name) {
          var updatePoints = [];
          var polyPoints = poly.points();
          for (var i = 0; i < polyPoints.length / 2; i++) {
            updatePoints.push(polyPoints[i * 2] + poly.getParent().x());
            updatePoints.push(polyPoints[i * 2 + 1] + poly.getParent().y());
          }
          poly.getParent().destroy();
          vc_this.currentDrawingShape = vc_this.drawGroup(
            updatePoints,
            vc_this.toolObject[1]
          );
          //使所有顶点在顶层显示
          vc_this.stage.find("Circle").forEach((element) => {
            element.moveToTop();
          });
          //添加删除撤销对象
          this.currentDel = vc_this.currentDrawingShape;
          this.currentCancel = vc_this.currentDrawingShape;
          vc_this.layer.draw();
          /*   vc_this.setMaskData(); */
        }
        // vc_this.$message({
        //   message: "修改成功！",
        //   type: "success",
        //   center: true,
        //   duration: 1000,
        // });
        vc_this.stage.container().style.cursor = "crosshair";
        //设置组不能拖动
        vc_this.currentDrawingShape.setAttr("draggable", false);
      });
      return poly;
    },
    /**
     *矩形
     * @param (currentTool, x, y, group)
     */
    drawRect(currentTool, x, y, group) {
      var rect = new Konva.Rect({
        name: currentTool.name + "rect",
        x: x,
        y: y,
        width: 0,
        height: 0,
        opacity: 0.5,
        /*   fill: currentTool.color, */
        stroke: currentTool.color,
        strokeScaleEnabled: false,
        strokeWidth: 1,
      });
      this.currentDrawingShape = rect;
      group.add(rect);
      var vc_this = this;
      rect.getParent().on("mouseleave", () => {
        vc_this.stage.container().style.cursor = "crosshair";
      });
      rect.getParent().on("mousedown", (e) => {
        if (e.evt.button == 0) {
          //如果不是正在绘画图形时
          if (!vc_this.drawing) {
            vc_this.stage.container().style.cursor = "move";
            //设置现在绘画节点的对象为该多边形和顶点的组
            vc_this.currentDrawingShape = rect.getParent();
            // 如果要让顶点和多边形一起拖拽，必须设置，多边形不能被拖拽
            rect.setAttr("draggable", false);
            rect.getParent().setAttr("draggable", true);
            //使所有顶点在顶层显示
            vc_this.stage.find("Circle").forEach((element) => {
              element.moveToTop();
            });
            //添加删除撤销对象
            this.currentDel = vc_this.currentDrawingShape;
            this.currentCancel = vc_this.currentDrawingShape;
            vc_this.layer.draw();
          } else {
            vc_this.stage.container().style.cursor = "crosshair";
            rect.getParent().setAttr("draggable", false);
          }
        }
      });
      rect.getParent().on("dragend", (e) => {
        if (currentTool.name === vc_this.toolObject[0].name) {
          var updatePoints = [];
          var rectPoints = rect
            .getParent()
            .getChildren((element) => {
              return element.getAttr("name") === currentTool.name + "line";
            })[0]
            .points();
          for (var i = 0; i < rectPoints.length / 2; i++) {
            updatePoints.push(rectPoints[i * 2] + rect.getParent().x());
            updatePoints.push(rectPoints[i * 2 + 1] + rect.getParent().y());
          }
          rect.getParent().destroy();
          vc_this.currentDrawingShape = vc_this.drawGroup(
            updatePoints,
            vc_this.toolObject[0]
          );
          //添加删除撤销对象
          this.currentDel = vc_this.currentDrawingShape;
          this.currentCancel = vc_this.currentDrawingShape;
          vc_this.layer.draw();
          /*   vc_this.setMaskData(); */
        }
        //使所有顶点在顶层显示
        vc_this.stage.find("Circle").forEach((element) => {
          element.moveToTop();
        });
        // vc_this.$message({
        //   message: "修改成功！",
        //   type: "success",
        //   center: true,
        //   duration: 1000,
        // });
        vc_this.stage.container().style.cursor = "crosshair";
        //设置组不能拖动
        vc_this.currentDrawingShape.setAttr("draggable", false);
      });
      return rect;
    },
    /**
     *多边形组
     * @param points 多边形绘画的各个顶点，类型数组
     */
    drawGroup(points, currentTool) {
      //拖拽组
      var group = new Konva.Group({
        name: currentTool.name + "Group",
        draggable: false,
      });
      switch (currentTool.type) {
        case "poly":
          for (var i = 0; i < points.length / 2; i++) {
            var p = {
              x: points[i * 2],
              y: points[i * 2 + 1],
            };
            if (i == 0) {
              //添加标签
              this.drawLabel(currentTool, p.x, p.y, group, this.label);
            }
            //添加多边形的点
            this.drawCircle(currentTool, p.x, p.y, group, points);
          }
          //绘画多边形
          var poly = this.drawPolygon(currentTool, points, group);
          console.log('绘画多边形');
          //添加多边形的边
          var polyline = this.drawLine(currentTool, points, group);
          poly.moveToBottom();
          polyline.moveToBottom();
          this.layer.draw();
          //使所有顶点在顶层显示
          this.stage.find("Circle").forEach((element) => {
            element.moveToTop();
          });
          break;
        case "rect":
          //添加矩形的点
          for (var i = 0; i < points.length / 2; i++) {
            var p = {
              x: points[i * 2],
              y: points[i * 2 + 1],
            };
            //添加矩形的点
            this.drawCircle(currentTool, p.x, p.y, group, points);
          }
          //修改顶点的名字
          group
            .getChildren((node) => {
              return node.getClassName() === "Circle";
            })[0]
            .name("rectTopLeft");
          group
            .getChildren((node) => {
              return node.getClassName() === "Circle";
            })[1]
            .name("rectTopRight");
          group
            .getChildren((node) => {
              return node.getClassName() === "Circle";
            })[2]
            .name("rectBottomRight");
          group
            .getChildren((node) => {
              return node.getClassName() === "Circle";
            })[3]
            .name("rectBottomLeft");
          //绘制矩形
          var rect = this.drawRect(currentTool, points[0], points[1], group);
          this.currentDrawingShape.setAttrs({
            width: points[4] - points[0],
            height: points[5] - points[1],
          });
          //添加矩形的边
          this.drawLine(currentTool, points, group);
          //添加标签
          this.drawLabel(
            currentTool,
            rect.getClientRect().x,
            rect.getClientRect().y,
            group,
            this.label
          );
          //使所有顶点在顶层显示
          this.stage.find("Circle").forEach((element) => {
            element.moveToTop();
          });
          break;
        default:
          break;
      }
      this.layer.add(group);
      this.layer.draw();
      return group;
    },
  },
  mounted() {
    this.initKonvaStage();
    this.$nextTick(() => {
      window.addEventListener("resize", this.resizeStage);
    });
    //禁止浏览器右击菜单
    // document.oncontextmenu = function (e) {
    //   return false;
    // };
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeStage);
    this.stage.destroy();
  }
};
</script>

<style scoped>
#map {
  background: #ddd;
  width: 100%;
  aspect-ratio: 16/9;
}

</style>


