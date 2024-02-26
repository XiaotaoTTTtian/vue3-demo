<template>
  <div class="knova_main">
    <div id="knovaId" class="knova_class"></div>
    <button @click="drawPolugonBtn">多边形绘制</button>
    <button>线段绘制</button>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import CanvasDraw from '../utils/canvasDraw'

const canvasInstance = ref()
onMounted(() => {
  const knovaElement = document.getElementById('knovaId')
  canvasInstance.value = new CanvasDraw({
    canvasId: 'knovaId',
    width: knovaElement.offsetWidth,
    height: knovaElement.offsetHeight,
  })
})
const drawPolugonBtn = () => {

  if (canvasInstance.value) {
    canvasInstance.value.drawPolygon()
  }
}
</script>

<style  scoped>
.knova_main {
  width: 100%;
  height: 100%;
}
.knova_class {
  width: 100%;
  height: 100%;
  background: #dbcccc;
}
</style>