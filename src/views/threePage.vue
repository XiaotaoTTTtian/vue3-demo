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

const guiFun = (obj) => {
  // console.log('degToRad', THREE.MathUtils.radToDeg(Math.PI));
  const gui = new GUI()
  gui.add(obj.rotation, 'x', -Math.PI, Math.PI).step(0.01).name('X Axis').listen()
  gui.add(obj.rotation, 'y', -Math.PI, Math.PI).step(0.01).name('Y Axis').listen()
  gui.add(obj.rotation, 'z', -Math.PI, Math.PI).step(0.01).name('Z Axis').listen()
}
// const objLoader = new OBJLoader();
// 部件一
// objLoader.load('http://192.168.1.120:12000/data/part/1/678b3131836dece72608518a04930031.obj', (obj) => {
  // 部件二
// objLoader.load('http://192.168.1.120:12000/data/part/1/4d8c48e1f6ee30b44bcf038df991d704.obj', (obj) => {
// objLoader.load('http://localhost:3000/static/2.obj', (obj) => {
//   obj.traverse((child) => {
//     if (child instanceof THREE.Mesh) {
//       // obj.scale.set(0.05, 0.05, 0.05)
//       // obj.position.set(-66.45922546386718, -36.071478271484374 ,-38.676980590820314)
//       // obj.scale.set(500, 500, 500)
//       obj.scale.multiplyScalar(100)
//       // new THREE.TextureLoader().load('http://192.168.1.120:14000/data/media/2/b6a89458985068c4300dee3b8d6ac75b/932a784674645309e3c971a092725313.JPG', (normalMap) => {
//       new THREE.TextureLoader().load('http://192.168.1.120:12000/data/noraml_map/1/4/84deaa2bdf7bd72ebf292f408d99ec75.jpg', (normalMap) => {
//       // new THREE.TextureLoader().load('http://192.168.1.120:12000/data/noraml_map/1/4/84deaa2bdf7bd72ebf292f408d99ec75.jpg', (normalMap) => {
//         // 设置纹理的矩阵，使其完全贴在模型上
//         // var matrix = new THREE.Matrix3();
//         // matrix.setUvTransform(0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,0, 0, 0, 1, 1, 1, 1, 0,);
//         // console.log(normalMap);
//         // matrix.setUvTransform(0, 0, 0, 1, 1, 1, 1, 0)
//         // normalMap.matrix = matrix
//         // normalMap.matrixAutoUpdate = false;
//         // var normalMap = new THREE.TextureLoader().load('http://192.168.1.120:14000/data/media/2/b6a89458985068c4300dee3b8d6ac75b/932a784674645309e3c971a092725313.JPG');
//         // normalMap.wrapS = THREE.RepeatWrapping;
//         // normalMap.wrapT = THREE.RepeatWrapping;
//         // normalMap.repeat.set( 20000, 20000 );
//         // normalMap.matrixAutoUpdate = false;
//         // var matrix = new THREE.Matrix3()
//         // matrix.set(
//         //   100, 100, 100,
//         //   100, 100, 100,
//         //   100, 100, 100
//         // )
//         // normalMap.matrix = matrix
//         // normalMap.needsUpdate = true;
//         // normalMap.minFilter = THREE.LinearMipmapLinearFilter;
//         // normalMap.magFilter = THREE.NearestFilter;
//         // normalMap.needsUpdate = true;
//         console.log(THREE.DoubleSide);
//         // normalMap.mapping = THREE.EquirectangularReflectionMapping;
//         const {x, y, z} = child.geometry.boundingSphere.center
//         child.position.set(x, y, z)
//         child.geometry.center()
//         var ambientColor = new THREE.Color(0.592157, 0.666667, 0.686275);
//         var diffuseColor = new THREE.Color(0.592157, 0.666667, 0.686275);
//         var specularColor = new THREE.Color(0xffffff);
//         child.material = new THREE.MeshPhysicalMaterial({
//                       roughness: 0.5,
//                       opacity: 1,
//                       transparent: true,
//                       specular: specularColor,
//                       shadowSide: THREE.DoubleSide,
//                       ambient: ambientColor,
//                       diffuse: diffuseColor,
//                       // specular: specularColor,
//         });
//         // child.geometry.attributes.normal.array = child.geometry.attributes.position.array
//         // child.needsUpdate  = true
//         renderer.render(scene, camera)
//         // 获取模型的几何中心点和包围盒大小
//         // rotateSelf(child)
//         guiFun(child)
//       });
//     // 将模型的中心点设置为包围盒的中心点
//     // obj.pivot.set(size.x / 2, size.y / 2, size.z / 2);
//     }
//   })
//   scene.add(obj)
// })
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
// window.addEventListener('click', clickEvent)
// 创建一个OBJLoader
// var mtlLoader = new MTLLoader()
// // // mtlLoader.load('http://localhost:3000/static/bbbbTest.mtl', (materials) => {
// mtlLoader.load('http://localhost:3000/static/aaaaatest.mtl', (materials) => {
// // mtlLoader.load('http://localhost:3000/static/ccccTest.mtl', (materials) => {
//   materials.preload()
//   var loader = new OBJLoader();
//   // console.log('材质信息', materials);
//   loader.setMaterials(materials)
//   loader.load('http://localhost:3000/static/1001.obj', (obj) => {
//   // loader.load('http://192.168.1.120:12000/data/part/1/76e5907202dc3391365372312602ab4e.obj', (obj) => {
//     // obj.scale.multiplyScalar(100)
//   // loader.load('http://192.168.1.120:12000/data/part/1/ddad9adc7cc88ae85109987036f37500.obj', (obj) => {
//     obj.traverse((child) => {
//       if (child instanceof THREE.Mesh) {
//         console.log('child', child);
//       }
//     })
//     scene.add(obj)
//   })
// })
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
  console.log(2222, object);
					object.traverse( ( child ) => {

						if ( child.isMesh ) {
              child.material = new THREE.MeshStandardMaterial({
                // color: '#ccc',
                // roughnessMap: specularMap,
                map: texture,
                metalness: 0.1,
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
specularMap = textureLoader.load( 'http://localhost:3000/static/material/streaked-metal1-albedo.png', render );
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
// var loader = new OBJLoader();
//   // console.log('材质信息', materials);
//   loader.load('http://localhost:3000/static/1001.obj', (obj) => {
//   // loader.load('http://192.168.1.120:12000/data/part/1/76e5907202dc3391365372312602ab4e.obj', (obj) => {
//     // obj.scale.multiplyScalar(100)
//   // loader.load('http://192.168.1.120:12000/data/part/1/ddad9adc7cc88ae85109987036f37500.obj', (obj) => {
//     obj.traverse((child) => {
//       if (child instanceof THREE.Mesh) {
//         console.log('child', child);
//         new THREE.TextureLoader().load('http://192.168.1.120:12000/data/noraml_map/1/4/84deaa2bdf7bd72ebf292f408d99ec75.jpg', (normalMap) => {
//           var matrix = new THREE.Matrix3();
//           matrix.setUvTransform(0, 0, 1, 0, 1, 1, 0, 1)
//           normalMap.matrix = matrix
//           // obj.scale.multiplyScalar(0.5)
//           child.material = new THREE.MeshPhysicalMaterial({
//             // map:normalMap
//           })
//           child.material.normalMap = normalMap
//           // child.geometry.attributes.position.array = child.geometry.attributes.normal.array
//           // child.geometry.attributes.normal.array = child.geometry.attributes.position.array
//           child.needsUpdate  = true
//         })
//       }
//     })
//     
//     scene.add(obj)
//   })
// 控制器
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
// 创建一个立方体
// var geometry = new THREE.BoxGeometry(1, 1, 1)
// const geometry = new THREE.TorusKnotGeometry( 10, 3, 200, 32 ).toNonIndexed();
// var normalMap = new THREE.TextureLoader().load('http://192.168.1.120:12000/data/noraml_map/1/4/84deaa2bdf7bd72ebf292f408d99ec75.jpg');
// // var normalMap = new THREE.TextureLoader().load(imgSS);
// //     // var normalMap = new THREE.TextureLoader().load('http://192.168.1.120:12000/data/noraml_map/1/4/84deaa2bdf7bd72ebf292f408d99ec75.jpg');
//     normalMap.wrapS = THREE.RepeatWrapping;
//     normalMap.wrapT = THREE.RepeatWrapping;
//     normalMap.repeat.set( 9, 1 );
// // 创建材质
// var material = new THREE.MeshPhysicalMaterial({
//   normalMap
// })
// material.color = new THREE.Color('#049ef4')
// // 创建网格
// var cube = new THREE.Mesh(geometry, material)
// scene.add(cube)
// 添加光源
// var light = new THREE.DirectionalLight(0xffffff)
// light.position.set(0, 0, 10)
// scene.add(light)
// const ambientLight = new THREE.AmbientLight( 0xcccccc, 3 );
const ambientLight = new THREE.AmbientLight( 0xffffff, 3 );
			scene.add( ambientLight );
      ambientLight.castShadow = true;
			// const light1 = new THREE.DirectionalLight( 0xffffff, 3 );
			// light1.position.set( 0, 200, 0 );
			// scene.add( light1 );
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
