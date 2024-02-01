<template>
  <canvas id="scene" style="width: 100%;height: 100%;" ></canvas>
  <!-- <div >
  </div> -->
</template>

<script setup>
import {onMounted} from 'vue'
import * as THREE from 'three'
import {OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
// import imgSS from '@/assets/brick_diffuse.jpg'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import {DDSLoader} from 'three/examples/jsm/loaders/DDSLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import {UIPanel} from '../utils/ui'
import {ViewHelper} from '../utils/ViewHelper'
import { ViewHelper as ViewHelperBase } from 'three/examples/jsm/helpers/ViewHelper.js';
// import {ViewHelper as ViewHelperBas} from 'three/examples/jsm/helpers/ViewHelper'

// import mtlTest from '@/assets/aaaaatest.mtl'
onMounted(() => {
  init()
})
let scene = null
let camera = null
let renderer = null
let viewHelper = null
const init = () => {
  scene = new THREE.Scene()
  var sceneBg = new THREE.TextureLoader().load(
    'http://192.168.1.54:3000/static/brick_diffuse.jpg'
  )
  scene.background = sceneBg
  const canvasDiv = document.getElementById('scene')
  camera = new THREE.PerspectiveCamera(
    75,
    canvasDiv.clientWidth / canvasDiv.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 500
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasDiv,
    // antialias: true,
      // alpha: true, // 是否支持透明度
      // preserveDrawingBuffer: true,
  })
  renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight)
  addViewHelper()
  animate()
  controlsFun()
  addAxesHelper()
  loadObj('http://192.168.1.54:3000/static/obj/0cd524b19b9d9e8a0380ba32d74bff8d_uv.obj')
}
// 动画
const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  viewHelper?.render(renderer)
}
// 添加视角指示器
const addViewHelper = () => {
  const canvasDiv = document.getElementById('scene')
  viewHelper = new ViewHelper(camera, canvasDiv)
  renderer.autoClear = false;
  controlsFun()
}
function controlsFun() {
  const globalControl = new OrbitControls(camera, renderer.domElement)
  globalControl.update()
}
// 用于简单模拟3个坐标轴的对象
const addAxesHelper = () => {
  const axesHelper = new THREE.AxesHelper( 50 );
  scene.add( axesHelper );
}
const loadObj = (url) => {
  new OBJLoader().load(url, object => {
    object.traverse(child => {
      scene.add(object)
    })
  })
}
const originViewHelper = () => {
  const canvasDiv = document.getElementById('scene')
  const viewHelper = new ViewHelperBase(camera, canvasDiv)
  scene.add(viewHelper)
}
</script>

<style lang="scss" scoped></style>
