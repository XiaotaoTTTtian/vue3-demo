<template>
  <canvas id="scene" style="width: 100%; height: 100%"></canvas>
  <button @click="createRecord">创建录制</button>
  <button @click="startRecord">开始录制</button>
  <button @click="endRecord">结束录制</button>
  <button @click="downloadRecord">下载录制</button>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
// import imgSS from '@/assets/brick_diffuse.jpg'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { UIPanel } from '../utils/ui'
import { ViewHelper } from '../utils/ViewHelper'
import { ViewHelper as ViewHelperBase } from 'three/examples/jsm/helpers/ViewHelper.js'
// import {ViewHelper as ViewHelperBas} from 'three/examples/jsm/helpers/ViewHelper'

// import mtlTest from '@/assets/aaaaatest.mtl'
onMounted(() => {
  init()
  // window.addEventListener('click', getCamera)
})
let scene = null
let camera = null
let renderer = null
let viewHelper = null
let globalControl = null
let bones = null
let skeletonHelper = null
let mesh = null
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
  // addViewHelper()
  animate()
  controlsFun()
  // addAxesHelper()
  loadObj('http://192.168.1.54:3000/static/threejs_examples/骨架.obj')
  // createdSkeleton()
  setTimeout(() => {
    addGui()
  }, 1000)
}
// 动画
const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  viewHelper?.render(renderer)
  // globalControl?.saveState()
  // globalControl?.update()
}
// 添加视角指示器
const addViewHelper = () => {
  const canvasDiv = document.getElementById('scene')
  viewHelper = new ViewHelper(camera, canvasDiv)
  renderer.autoClear = false
  // controlsFun()
}
function controlsFun() {
  globalControl = new OrbitControls(camera, renderer.domElement)
  // globalControl.enablePan = false
  globalControl.update()
  // globalControl.addEventListener('change', getCamera)
}
// 用于简单模拟 3 个坐标轴的对象
const addAxesHelper = () => {
  const axesHelper = new THREE.AxesHelper(50)
  scene.add(axesHelper)
}
const loadObj = (url) => {
  new OBJLoader().load(url, (object) => {

    object.children.forEach((child, index) => {
      const geometry = getGeometry(child.geometry)
      const bones = getBones()
      mesh = createMesh(geometry,bones, bones[index])
      scene.add(mesh)

      console.log('geometry obj', geometry);
    })
  })
}
const getGeometry = (geometry) => {
  const segmentHeight = 8
  const segmentCount = 1
  const height = segmentHeight * segmentCount
  const halfHeight = height * 0.5
  const sizing = {
    segmentHeight: segmentHeight,
    segmentCount: segmentCount,
    height: height,
    halfHeight: halfHeight,
  }
  const position = geometry.attributes.position
  const vertex = new THREE.Vector3()

  const skinIndices = []
  const skinWeights = []
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)

    const y = vertex.y + sizing.halfHeight

    const skinIndex = Math.floor(y / sizing.segmentHeight)
    const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight

    skinIndices.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  return geometry

}
const getBones = () => {
  const segmentHeight = 8
  const segmentCount = 1
  const height = segmentHeight * segmentCount
  const halfHeight = height * 0.5
  const sizing = {
    segmentHeight: segmentHeight,
    segmentCount: segmentCount,
    height: height,
    halfHeight: halfHeight,
  }
  bones = []

  let prevBone = new THREE.Bone()
  bones.push(prevBone)
  prevBone.position.y = -sizing.halfHeight

  for (let i = 0; i < sizing.segmentCount; i++) {
    const bone = new THREE.Bone()
    bone.position.y = sizing.segmentHeight
    bones.push(bone)
    prevBone.add(bone)
    prevBone = bone
  }

  return bones
} 
const originViewHelper = () => {
  const canvasDiv = document.getElementById('scene')
  const viewHelper = new ViewHelperBase(camera, canvasDiv)
  scene.add(viewHelper)
}
const addGui = () => {
  const gui = new GUI()
  const cameraFolder = gui.addFolder('相机')
  cameraFolder.add(camera.position, 'x', -100, 100).step(1).name('x Axis')
  cameraFolder.add(camera.position, 'y', -100, 100).step(1).name('y Axis')
  cameraFolder.add(camera.position, 'z', -100, 100).step(1).name('z Axis')
  // 添加骨骼 gui
  // let folder = gui.addFolder('骨骼部件')
  // const bones = mesh.skeleton.bones
  // bones.forEach((bone, i) => {

  //   folder = gui.addFolder('Bone ' + i)
  //   folder.add(bone.position, 'x', -10 + bone.position.x, 10 + bone.position.x)
  //   folder.add(bone.position, 'y', -10 + bone.position.y, 10 + bone.position.y)
  //   folder.add(bone.position, 'z', -10 + bone.position.z, 10 + bone.position.z)
  //   folder.add(bone.rotation, 'x', -Math.PI * 0.5, Math.PI * 0.5)
  //   folder.add(bone.rotation, 'y', -Math.PI * 0.5, Math.PI * 0.5)
  //   folder.add(bone.rotation, 'z', -Math.PI * 0.5, Math.PI * 0.5)
  //   folder.add(bone.scale, 'x', 0, 2)
  //   folder.add(bone.scale, 'y', 0, 2)
  //   folder.add(bone.scale, 'z', 0, 2)
  //   folder.controllers[0].name('position.x')
  //   folder.controllers[1].name('position.y')
  //   folder.controllers[2].name('position.z')
  //   folder.controllers[3].name('rotation.x')
  //   folder.controllers[4].name('rotation.y')
  //   folder.controllers[5].name('rotation.z')
  //   folder.controllers[6].name('scale.x')
  //   folder.controllers[7].name('scale.y')
  //   folder.controllers[8].name('scale.z')
  // })

}
const getCamera = () => {


}
// 创建骨架
const createdSkeleton = () => {
  const segmentHeight = 8
  const segmentCount = 5
  const height = segmentHeight * segmentCount
  const halfHeight = height * 0.5

  const sizing = {
    segmentHeight: segmentHeight,
    segmentCount: segmentCount,
    height: height,
    halfHeight: halfHeight,
  }

  const geometry = createGeometry(sizing)
  console.log('geometry', geometry);
  const bones = createBones(sizing)

  mesh = createMesh(geometry, bones)

  mesh.scale.multiplyScalar(1)
  scene.add(mesh)
}
function createGeometry(sizing) {
  const geometry = new THREE.CylinderGeometry(
    5, // radiusTop
    5, // radiusBottom
    sizing.height, // height
    8, // radiusSegments
    sizing.segmentCount * 3, // heightSegments
    true // openEnded
  )

  const position = geometry.attributes.position

  const vertex = new THREE.Vector3()

  const skinIndices = []
  const skinWeights = []

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)

    const y = vertex.y + sizing.halfHeight

    const skinIndex = Math.floor(y / sizing.segmentHeight)
    const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight

    skinIndices.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  return geometry
}
function createBones(sizing) {
  bones = []

  let prevBone = new THREE.Bone()
  bones.push(prevBone)
  prevBone.position.y = -sizing.halfHeight

  for (let i = 0; i < sizing.segmentCount; i++) {
    const bone = new THREE.Bone()
    bone.position.y = sizing.segmentHeight
    bones.push(bone)
    prevBone.add(bone)
    prevBone = bone
  }

  return bones
}
function createMesh(geometry, bones, bone) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    flatShading: true,
  })

  const mesh = new THREE.SkinnedMesh(geometry, material)

  const skeleton = new THREE.Skeleton(bones)

  mesh.add(bone)

  mesh.bind(skeleton)

  skeletonHelper = new THREE.SkeletonHelper(mesh)
  skeletonHelper.material.linewidth = 2
  scene.add(skeletonHelper)

  return mesh
}
function createMesh1(geometry, bones) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    flatShading: true,
  })

  const mesh = new THREE.SkinnedMesh(geometry, material)

  const skeleton = new THREE.Skeleton(bones)

  mesh.add(bones[0])

  mesh.bind(skeleton)

  skeletonHelper = new THREE.SkeletonHelper(mesh)
  skeletonHelper.material.linewidth = 2
  scene.add(skeletonHelper)

  return mesh
}
let chunks = new Set()
let mediaRecord = null
function createRecord () {
  const canvas = document.getElementById('scene')
  const mediaStream = canvas.captureStream(10) // 设置帧频率(FPS)
  mediaRecord = new MediaRecorder(mediaStream, {
      videoBitsPerSecond: 8500000
  })
  mediaRecord.ondataavailable = (e) => { // 接收数据
      chunks.add(e.data)
  }
}
const startRecord = () => {
  chunks = new Set()
  mediaRecord = null
  createRecord()
  mediaRecord.start()
}
const endRecord = () => {
  mediaRecord.stop()
  setTimeout(() => {
    downloadRecord()
  }, 100)
}
const downloadRecord = () => {
  const videoBlob = new Blob(chunks, { 'type' : 'video/mp4' })
  const videoUrl = window.URL.createObjectURL(videoBlob)
  console.log(videoUrl);
}
</script>

<style lang="scss" scoped></style>
