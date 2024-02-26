<template>
  <!-- <div>
  </div> -->
  <canvas id="scene1" style="width: 100%; height: 100%"></canvas>
  <button @click="uploadModelBtn">上传模型部件</button>
  <button @click="uploadImgBtn">上传模型图片</button>
  <!-- <button @click="textureDatabase">图片库</button> -->
  <button v-if="loading"> 加载中</button>
  <button @click="loadBtn"> load</button>
  <button @click="switchMatailer"> 材质切换 </button>
  <button @click="switchMatailer1"> 材质切换1 </button>
  <button @click="addPhysicsTexture"> 添加物理材质 </button>
  <button @click="deleteShaderMap"> 删除着色器贴图 </button>
  <input type="file" @change="modelFileChange" id="modelFileId" style="display: none;" multiple />
  <input type="file" @change="physicsModelFileChange" id="physicsModelFileId" style="display: none;" multiple />
  <input type="file" @change="imgFileChange" id="imgFileId" style="display: none;" />
  <imagePage @uploadFile="imgFileUpload" />
</template>

<script setup>
import {ref} from 'vue'
import * as THREE from 'three'
import { onMounted } from 'vue'
import vertexShader from '../utils/vertexShader.js'
import fragmentShader from '../utils/fragmentShader.js'
import {OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import {uploadimgApi, getImgApi} from '../utils/request'
import {getFourImgUrl} from '../utils/utils'
import imagePage from '@/views/imagePage'

let scene = null
let camera = null
let renderer = null
let uniforms = {}
let raycaster = null
let loading = ref(false)
let rotateSelfControl = null
let globalControl = null
const inituniforms =  {
  LightDirection1: { type: "v3", value: new THREE.Vector3(0.0, 10.0, 10.0) },
	specularColor: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) },
  diffuseMap: { type: "t", value: null },
  normalMap: { type: "t", value: null },
  roughnessMap: { type: "t", value: null },
	specularMap: { type: "t", value: null },
  luminance: { value: 60.0}
  // Smoothness: { type: "f", value: 20.0 },
}
let currentSelectModelUuid = ''
const init = () => {
  scene = new THREE.Scene()
  var sceneBg = new THREE.TextureLoader().load(
    'http://192.168.1.54:3000/static/brick_diffuse.jpg'
  )
  scene.background = sceneBg
  // scene.background = new THREE.Color(0xffffff)
  const canvasDiv = document.getElementById('scene1')
  camera = new THREE.PerspectiveCamera(
    75,
    canvasDiv.clientWidth / canvasDiv.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasDiv,
  })
  renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight)
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  raycaster = new THREE.Raycaster()

  // const textureLoader = new THREE.TextureLoader();
  // uniforms = {
  //   LightDirection1: { type: "v3", value: new THREE.Vector3(0.0, 10.0, 10.0) },
	// 	specularColor: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) },
  //   diffuseMap: { type: "t", value: null },
  //   normalMap: { type: "t", value: null },
  //   roughnessMap: { type: "t", value: null },
	// 	specularMap: { type: "t", value: null },
  // }
  animate()
  // objAdd()
  controlsFun()
  addGui()
  addLight()
}
function controlsFun() {
  globalControl = new OrbitControls(camera, renderer.domElement)
  globalControl.update()
}
  const modelInfoObj = {
    task_id: 11,
    part_id:91,
    scale: 1
  }
const curretModelMaterial = {
  luminance: 60.0
}
function addGui() {
  const lightObj = {
    x: 0,
    y: 10,
    z: 10,
  }
  const gui = new GUI()
  const lightFolder = gui.addFolder('灯光')
  lightFolder.add(lightObj, 'x', -100, 100).step(1).name('light x').onChange((e) => {

    Object.keys(uniforms).forEach(key => {
      const {y, z} = uniforms[key].LightDirection1.value
      uniforms[key].LightDirection1.value = new THREE.Vector3(e,y,z)
    })
    // uniforms.LightDirection1.value = new THREE.Vector3(e,y,z)
  })
  lightFolder.add(lightObj, 'y', -100, 100).step(1).name('light y').onChange((e) => {
    // const {x, z} = uniforms.LightDirection1.value
    // uniforms.LightDirection1.value = new THREE.Vector3(x,e,z)
    Object.keys(uniforms).forEach(key => {
      const {x, z} = uniforms[key].LightDirection1.value
      uniforms[key].LightDirection1.value = new THREE.Vector3(x,e,z)
    })
  })
  lightFolder.add(lightObj, 'z', -100, 100).step(1).name('light z').onChange((e) => {
    // const {x, y} = uniforms.LightDirection1.value
    // uniforms.LightDirection1.value = new THREE.Vector3(x,y,e)
    Object.keys(uniforms).forEach(key => {
      const {x, y} = uniforms[key].LightDirection1.value
      uniforms[key].LightDirection1.value = new THREE.Vector3(x,y,e)
    })
  })
  const cameraFolder = gui.addFolder('相机位置')
  cameraFolder.add(camera.position, 'x', -100, 100).step(1).name('camera x')
  cameraFolder.add(camera.position, 'y', -100, 100).step(1).name('camera y')
  cameraFolder.add(camera.position, 'z', -100, 100).step(1).name('camera z')
  const modelInfo = gui.addFolder('模型信息')
  modelInfo.add(modelInfoObj, 'task_id', 0, 1000).step(1).name('任务id')
  modelInfo.add(modelInfoObj, 'part_id', 0, 1000).step(1).name('部件id')
  modelInfo.add(modelInfoObj, 'scale', 0, 1000).step(1).name('模型缩放')
  const textureInfo = gui.addFolder('材质信息')
  textureInfo.add(curretModelMaterial, 'luminance', 0, 100).step(1).name('部件亮度').onChange(val => {
    if (currentSelectModelUuid !== '') {
      uniforms[currentSelectModelUuid].luminance.value = val
    }
  })
}
const uploadModelBtn = () => {
  document.getElementById('modelFileId')?.click()
}
const uploadImgBtn = () => {
  if (currentSelectModelUuid === '') {
    alert('请先选中模型')
    return
  }
  document.getElementById('imgFileId')?.click()
}
const modelFileChange = (e) => {
  const files = Array.from(e.target.files)

  files.forEach(file => {
    fileLoadFun(file)
  })
  setTimeout(() => {
    const fileDom = document.getElementById('modelFileId');
    if (fileDom) {
      fileDom.value = '';
    }
  }, 100)
  // fileLoadFun(file)
}
const fileLoadFun = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const filePath = e.target.result // 获取文件的路径
      loadObjFile(filePath)
    }
    reader.readAsDataURL(file)
  }
}
const loadObjFile = (url) => {
  new OBJLoader().load(url, object => {
    object.traverse((child) => {
      // 物理材质
      setTimeout(() => {
        if (child instanceof THREE.Mesh) {
          // uniforms[child.uuid] = JSON.parse(JSON.stringify(inituniforms))

          const material = new THREE.MeshPhysicalMaterial({
            metalness: 1,
            roughness: 1,
            // opacity: 0.1,
            transparent: true, // 如果设置为false则透明度不生效
          })

          // child.geometry.computeVertexNormals()
          const { x, y, z } = child.geometry.boundingSphere.center
          child.position.set(x, y, z)
          child.geometry.center()
          child.material = material
        }
      }, 1000)
      // 着色器材质
      // setTimeout(() => {
      //   if (child instanceof THREE.Mesh) {
      //     uniforms[child.uuid] = JSON.parse(JSON.stringify(inituniforms))

      //     const material = new THREE.ShaderMaterial({
      //       uniforms: uniforms[child.uuid],
      //       vertexShader: vertexShader,
      //       fragmentShader: fragmentShader,
      //     })

      //     // child.geometry.computeVertexNormals()
      //     const { x, y, z } = child.geometry.boundingSphere.center
      //     child.position.set(x, y, z)
      //     child.geometry.center()
      //     child.material = material
      //   }
      // }, 1000)
    })
    object.scale.set(modelInfoObj.scale, modelInfoObj.scale, modelInfoObj.scale)
    scene.add(object)

  })

}
const imgFileChange =async (e) => {
  
  const file = e.target.files[0]
  const fileDom = document.getElementById('imgFileId');
  if (fileDom) {
    fileDom.value = '';
  }
  imgFileUpload(file)
  // if (file) {
  //   const formData = new FormData()
  //   formData.append("user_id", '1')
  //   formData.append("task_id", modelInfoObj.task_id + '')
  //   formData.append("part_id", modelInfoObj.part_id + '')
  //   formData.append('picture', file)
  //   loading.value = true

  //   const {data} = await uploadimgApi(formData)
  //   if (data.status > 0) {
  //     getFourImgFun()
  //   }
  //   loading.value = false
  // }
}
const imgFileUpload =async (file) => {
  if (currentSelectModelUuid === '') {
    alert('请先选中模型')
    return
  }
  if (file) {
    const formData = new FormData()
    formData.append("user_id", '1')
    formData.append("task_id", modelInfoObj.task_id + '')
    formData.append("part_id", modelInfoObj.part_id + '')
    formData.append('picture', file)
    loading.value = true

    const {data} = await uploadimgApi(formData)
    if (data.status > 0) {
      getFourImgFun()
    }
    loading.value = false
  }
}
// diffuseMap: { type: "t", value: textureLoader.load("http://192.168.1.54:3000/static/material/diffuse.png") },
//           normalMap: { type: "t", value: textureLoader.load("http://192.168.1.54:3000/static/material/normal.png") },
//           roughnessMap: { type: "t", value: textureLoader.load("http://192.168.1.54:3000/static/material/roughness.png") },
// 					specularMap: { type: "t", value: textureLoader.load("http://192.168.1.54:3000/static/material/specular.png") },
let maps = {
  diffuseMap: 'http://192.168.1.54:3000/static/img/1.png',
  normalMap: 'http://192.168.1.54:3000/static/img/1.png',
  roughnessMap: 'http://192.168.1.54:3000/static/img/1.png',
  specularMap: 'http://192.168.1.54:3000/static/img/1.png'
  // specularMap: 'http://192.168.1.120:12000/data/maps/1/11/91/output_dir/8a7277c9ca4294849f8e9989536b610e-specular.png'
}
// let maps = {
//   diffuseMap: 'http://192.168.1.54:3000/static/img/16.png',
//   normalMap: 'http://192.168.1.54:3000/static/img/18.png',
//   roughnessMap: 'http://192.168.1.54:3000/static/img/17.png',
//   specularMap: 'http://192.168.1.54:3000/static/img/15.png'
// }
// let maps = {
//   diffuseMap: 'http://192.168.1.54:3000/static/material/diffuse.png',
//   normalMap: 'http://192.168.1.54:3000/static/material/normal.png',
//   roughnessMap: 'http://192.168.1.54:3000/static/material/roughness.png',
//   specularMap: 'http://192.168.1.54:3000/static/material/specular.png'
// }
const getFourImgFun =async () => {
  const params = {
    user_id: 1,
    task_id: modelInfoObj.task_id,
    part_id: modelInfoObj.part_id,
  }
  const {data} = await getImgApi(params)

  if (data.status > 0) {
    const mapClass = getFourImgUrl(data.data)

    chartletBtn(mapClass)
    // return 
  }
  // return null
}
const loadBtn = () => {
  chartletBtn(maps)
}
const chartletBtn = (mapClass) => {
  const textureLoader = new THREE.TextureLoader();

  // uniforms[currentSelectModelUuid].diffuseMap.value = textureLoader.load('http://192.168.1.54:3000/static/img/1.png')
  uniforms[currentSelectModelUuid].diffuseMap.value = textureLoader.load(mapClass.diffuseMap)
  uniforms[currentSelectModelUuid].normalMap.value = textureLoader.load(mapClass.normalMap)
  uniforms[currentSelectModelUuid].roughnessMap.value = textureLoader.load(mapClass.roughnessMap)
  uniforms[currentSelectModelUuid].specularMap.value = textureLoader.load(mapClass.specularMap)
  uniforms[currentSelectModelUuid].diffuseMap.value.wrapS = uniforms[currentSelectModelUuid].diffuseMap.value.wrapT = THREE.RepeatWrapping;
	uniforms[currentSelectModelUuid].diffuseMap.value.repeat.set( 2, 2 );
}
const deleteShaderMap = () => {
  if (currentSelectModelUuid === '') {
    alert('请先选中模型')
    return
  }
  uniforms[currentSelectModelUuid].diffuseMap.value = null
  uniforms[currentSelectModelUuid].normalMap.value = null
  uniforms[currentSelectModelUuid].roughnessMap.value = null
  uniforms[currentSelectModelUuid].specularMap.value = null
  // uniforms[currentSelectModelUuid].diffuseMap.value.wrapS = uniforms[currentSelectModelUuid].diffuseMap.value.wrapT = null
}
// 点击选中模型
const modelSelectFun = (event) => {
  const pointer = new THREE.Vector2()
  const canvasDiv = document.getElementById('scene1')
  pointer.x = ((event.clientX - 220) / canvasDiv.width) * 2 - 1
  pointer.y = -((event.clientY - 0) / canvasDiv.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  let intersects = raycaster.intersectObjects(scene.children.filter(item => item.isGroup))
  
  if (intersects && intersects.length) {

    modelControlFun(intersects[0].object)
    currentSelectModelUuid = intersects[0].object.uuid
    intersects = null
  } else {
    disposeTransformControls()
    globalControl.enabled = true
    currentSelectModelUuid = ''
  }
}
const modelControlFun = (mesh) => {
  disposeTransformControls()

  rotateSelfControl = new TransformControls(camera, renderer.domElement)
  rotateSelfControl.setMode('translate')
  rotateSelfControl.attach(mesh)
  scene.add(rotateSelfControl)
  // 禁止全局控制器
  globalControl.enabled = false
}
const disposeTransformControls = () => {
  if (rotateSelfControl) {
    rotateSelfControl.dispose()
    rotateSelfControl.detach()
    rotateSelfControl = null
  }
}
const keyupFun = (e) => {
  const keyName = e.key
  switch (keyName) {
    case 'w':
      // 移动
      rotateSelfControl?.setMode('translate')
      break;
    case 'e':
      // 旋转
      rotateSelfControl?.setMode('rotate')
      break;
  
    default:
      break;
  }
}
const addPhysicsTexture = () => {
  // const light1 = 
  document.getElementById('physicsModelFileId')?.click()
}
const physicsModelFileChange = () => {
  const files = Array.from(e.target.files)

  files.forEach(file => {
    fileLoadFun1(file)
  })
  setTimeout(() => {
    const fileDom = document.getElementById('physicsModelFileId');
    if (fileDom) {
      fileDom.value = '';
    }
  }, 100)
}
const fileLoadFun1 = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const filePath = e.target.result // 获取文件的路径
      loadObjFile1(filePath)
    }
    reader.readAsDataURL(file)
  }
}
const loadObjFile1 = (url) => {
  new OBJLoader().load(url, object => {
    object.traverse((child) => {
      setTimeout(() => {
        if (child instanceof THREE.Mesh) {
          uniforms[child.uuid] = JSON.parse(JSON.stringify(inituniforms))

          const material = new THREE.ShaderMaterial({
            uniforms: uniforms[child.uuid],
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
          })

          // child.geometry.computeVertexNormals()
          const { x, y, z } = child.geometry.boundingSphere.center
          child.position.set(x, y, z)
          child.geometry.center()
          child.material = material
        }
      }, 1000)
    })
    object.scale.set(modelInfoObj.scale, modelInfoObj.scale, modelInfoObj.scale)
    scene.add(object)
  })

}
const addLight = () => {
  const light1 = new THREE.DirectionalLight(0xffffff)
    // directionalLight.name = id
    light1.position.set(0, 0, 5)
    light1.target.position.set(0, 0, 0)
    scene.add(light1)
    scene.add(light1.target)
  const light2 = new THREE.DirectionalLight(0xffffff)
    // directionalLight.name = id
    light2.position.set(0, 0, -5)
    light2.target.position.set(0, 0, 0)
    scene.add(light2)
    scene.add(light2.target)
    const light3 = new THREE.DirectionalLight(0xffffff)
    light3.position.set(0, 5, 0)
    light3.target.position.set(0, 0, 0)
    scene.add(light3)
    scene.add(light3.target)
    const light4 = new THREE.DirectionalLight(0xffffff)
    light4.position.set(0, -5, 0)
    light4.target.position.set(0, 0, 0)
    scene.add(light4)
    scene.add(light4.target)
    const light5 = new THREE.DirectionalLight(0xffffff)
    light5.position.set(5, 0, 0)
    light5.target.position.set(0, 0, 0)
    scene.add(light5)
    scene.add(light5.target)
    const light6 = new THREE.DirectionalLight(0xffffff)
    light6.position.set(-5, 0, 0)
    light6.target.position.set(0, 0, 0)
    scene.add(light6)
    scene.add(light6.target)
}
const switchMatailer = () => {
  if (currentSelectModelUuid === '') {
    alert('请先选中模型')
    return
  }
  const currentModel = scene.getObjectByProperty('uuid', currentSelectModelUuid)
  
  currentModel.material.dispose()
  currentModel.material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
  })
}
const switchMatailer1 = () => {
  if (currentSelectModelUuid === '') {
    alert('请先选中模型')
    return
  }
  const currentModel = scene.getObjectByProperty('uuid', currentSelectModelUuid)
  currentModel.material.dispose()
  uniforms[currentSelectModelUuid] = JSON.parse(JSON.stringify(inituniforms))
  currentModel.material = new THREE.ShaderMaterial({
    uniforms: uniforms[currentSelectModelUuid],
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  })
}
onMounted(() => {
  init()
  window.addEventListener('dblclick', modelSelectFun)
  window.addEventListener('keyup', keyupFun)
  // const memoryInfo = window.performance.memory.jsHeapSizeLimit / (1024 * 1024);

})
</script>

<style lang="scss" scoped></style>
