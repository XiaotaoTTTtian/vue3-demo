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
// import mtlTest from '@/assets/aaaaatest.mtl'
onMounted(() => {
  init()
})
const init = () => {
  var scene = new THREE.Scene()
// scene.background = new THREE.Color('#ccc')
var sceneBg = new THREE.TextureLoader().load('http://localhost:3000/static/brick_diffuse.jpg');
scene.background = sceneBg
// 创建相机
const canvasDiv = document.getElementById('scene');
var camera = new THREE.PerspectiveCamera(
  75,
  canvasDiv.clientWidth / canvasDiv.clientHeight,
  0.1,
  1000
)
camera.position.z = 5
// 创建渲染器
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvasDiv,
})
// renderer.physicallyCorrectLights = true
renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight)
// document.body.appendChild(renderer.domElement)
let objUuid = ''
const guiFun = () => {
  const obj = {
    reflectivity: 0.5,
  }
  // console.log('degToRad', THREE.MathUtils.radToDeg(Math.PI));
  const gui = new GUI()
  // gui.add(obj.rotation, 'x', -Math.PI, Math.PI).step(0.01).name('X Axis').listen()
  // gui.add(obj.rotation, 'y', -Math.PI, Math.PI).step(0.01).name('Y Axis').listen()
  // gui.add(obj.rotation, 'z', -Math.PI, Math.PI).step(0.01).name('Z Axis').listen()
  gui.add(obj, 'reflectivity', 0, 1).step(0.1).name('反射率').onChange((e) => {
    const foundSphere = scene.getObjectByProperty('uuid', objUuid)
    console.log('foundSphere', foundSphere);
    foundSphere.material.reflectivity = e
    foundSphere.material.needsUpdate = true
  })
}
guiFun()
var raycaster = new THREE.Raycaster()
function rotateSelf(mesh) {
    const orbit = new OrbitControls(camera, renderer.domElement)
    orbit.enabled = true
    orbit.update()
    const control = new TransformControls(camera, renderer.domElement)
    console.log('init', mesh);
    control.addEventListener('dragging-changed', (e) => {
      console.log( mesh.rotation);
      const {_x, _y, _z} = mesh.rotation
      console.log(_x, _y, _z);
      orbit.enabled = !e.value
    })
    control.addEventListener('objectChange', e => {
      console.log('objectChange', e);
    })
    control.setMode( 'rotate' )
    control.attach(mesh)
    // scene.add(orbit)
    scene.add(control)
  }
const clickEvent = (event) => {
  var pointer = new THREE.Vector2()
  pointer.x = ( (event.clientX - 0) / window.innerWidth ) * 2 - 1
  pointer.y = - ( (event.clientY - 40) / window.innerHeight ) * 2 + 1
  raycaster.setFromCamera( pointer, camera )
  var intersects = raycaster.intersectObjects( scene.children )
  console.log('click', intersects);
  if (intersects && intersects.length) {
    console.log('aaaa', intersects[0].object);
    rotateSelf(intersects[0].object)
  }
}
function render() {

renderer.render( scene, camera );

}
function generateRandomArray(length, includeZero, includeOne) {
  var arr = [];
  
  for (var i = 0; i < length; i++) {
    var randomValue = Math.random(); // 生成0到1之间的随机数
    
    if (!includeZero && randomValue === 0) {
      randomValue += 0.1; // 避免生成0
    }
    
    if (!includeOne && randomValue === 1) {
      randomValue -= 0.1; // 避免生成1
    }
    
    arr.push(randomValue);
  }
  
  return arr;
}
let object, texture,specularMap
function loadModel() {
  // console.log(2222, object);
					object.traverse( ( child ) => {

						if ( child.isMesh ) {
              console.log('child', child);
              objUuid = child.uuid
              child.material = new THREE.MeshPhysicalMaterial({
                // color: '#ccc',
                map: specularMap,
                // map: texture,
                // metalness: 0.1,
                transparent: true,
              })
              child.needsUpdate  = true
            }
					} );
          
					// object.position.y = - 0.95;
					// object.scale.setScalar( 0.1);
					// object.scale.setScalar( 0.0001 );
					// object.scale.setScalar( 100 );
					scene.add( object );

					// render();
          render()

				}
const manager = new THREE.LoadingManager( loadModel );
const textureLoader = new THREE.TextureLoader( manager );
// texture = textureLoader.load( 'http://localhost:3000/static/1111.jpg', render );
// texture = textureLoader.load( 'http://localhost:3000/static/threejs_examples/uv_grid_opengl.jpg', render );
// texture = textureLoader.load( 'http://localhost:3000/static/material/lightgold_preview.jpg', render );
texture = textureLoader.load( 'http://localhost:3000/static/material/diffuse.png', render );
specularMap = textureLoader.load( 'http://localhost:3000/static/material/diffuse.png', render );
// texture.colorSpace = THREE.SRGBColorSpace;
var loader = new OBJLoader(manager);
// loader.load('http://localhost:3000/static/threejs_examples/male02.obj', (obj) => {
// loader.load('http://localhost:3000/static/1001.obj', (obj) => {
loader.load('http://localhost:3000/static/material/sphere.obj', (obj) => {
  object = obj
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  console.log(1111, size);
})
// 控制器
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
// const ambientLight = new THREE.AmbientLight( 0xffffff, 3 );
// 			scene.add( ambientLight );
//       ambientLight.castShadow = true;
			const light1 = new THREE.DirectionalLight( 0xffffff, 2 );
			light1.position.set( 0, 200, 0 );
			scene.add( light1 );
      // light1.castShadow = true;
			// const light2 = new THREE.DirectionalLight( 0xffffff, 3 );
			// light2.position.set( 100, 200, 100 );
			// scene.add( light2 );
      // light2.castShadow = true;
			// const light3 = new THREE.DirectionalLight( 0xffffff, 3 );
      // light3.castShadow = true;
			// light3.position.set( - 100, - 200, - 100 );
			// scene.add( light3 );
function animate() {
  requestAnimationFrame(animate)
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
  renderer.render(scene, camera)
}
animate()
}

</script>

<style lang="scss" scoped></style>
