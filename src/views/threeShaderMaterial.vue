<template>
  <!-- <div>
  </div> -->
  <canvas id="scene1" style="width: 100%; height: 100%"></canvas>
</template>

<script setup>
import * as THREE from 'three'
import {onMounted} from 'vue'


const init = () => {
  var scene = new THREE.Scene()
  var sceneBg = new THREE.TextureLoader().load(
    'http://localhost:3000/static/brick_diffuse.jpg'
  )
  scene.background = sceneBg
  const canvasDiv = document.getElementById('scene1')
  var camera = new THREE.PerspectiveCamera(
    75,
    canvasDiv.clientWidth / canvasDiv.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasDiv,
  })
  renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight)
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
  function objAdd() {
    
  }
}
onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped></style>
