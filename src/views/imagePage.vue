<template>
  <div class="img_main">
    <button :class="{active: texturetype === 'imgs2'}" @click="switchTextureType('imgs2')">金属</button>
    <button :class="{active: texturetype === 'imgs1'}" @click="switchTextureType('imgs1')">混合</button>
    <button :class="{active: texturetype === 'imgs3'}" @click="switchTextureType('imgs3')">纹理增强</button>
    <template v-for="url in imgArr" :key="url">
      <img :src="url" alt="" :id="url" @click="loadImgBtn(url)" class="img">
    </template>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const emit = defineEmits(['uploadFile'])
const imgs1 = [
  'http://localhost:3000/static/img/1.png',
  'http://localhost:3000/static/img/2.png',
  'http://localhost:3000/static/img/3.png',
  'http://localhost:3000/static/img/4.png',
  'http://localhost:3000/static/img/5.png',
  'http://localhost:3000/static/img/6.png',
  'http://localhost:3000/static/img/7.png',
  // 'http://localhost:3000/static/img/8.png',
  'http://localhost:3000/static/img/9.png',
  'http://localhost:3000/static/img/10.png',
  'http://localhost:3000/static/img/11.png',
  'http://localhost:3000/static/img/12.png',
  'http://localhost:3000/static/img/13.png',
  'http://localhost:3000/static/img/14.png',
  'http://localhost:3000/static/img/19.png',
  'http://localhost:3000/static/img/20.png',
  'http://localhost:3000/static/img/21.png',
  'http://localhost:3000/static/img/22.png',
  'http://localhost:3000/static/img/23.png',
  'http://localhost:3000/static/img/24.png',
  'http://localhost:3000/static/img/25.png',
  'http://localhost:3000/static/texture/06-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/06-scale_1_im_7_col.png',
  'http://localhost:3000/static/texture/15-scale_1_im_5_col.png',
  'http://localhost:3000/static/texture/16a-scale_2_im_10_col.png',
  'http://localhost:3000/static/texture/20-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/21-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/22a-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/22b-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/22c-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/22d-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/42-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/44-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/46-scale_1_im_1_col.png',
  'http://localhost:3000/static/texture/54a-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/54d-scale_2_im_1_col.png',
  'http://localhost:3000/static/texture/cushion1-a-p001.png',
  'http://localhost:3000/static/texture/floor2-a-p001.png',
  'http://localhost:3000/static/texture/scarf1-a-p001.png',
  'http://localhost:3000/static/texture/screen1-a-p001.png',
  'http://localhost:3000/static/texture/seat1-a-p001.png',
  'http://localhost:3000/static/texture/seat2-a-p001.png',
  'http://localhost:3000/static/texture/stone1-a-p001.png',
  'http://localhost:3000/static/texture/stoneslab1-a-p001.png',
  'http://localhost:3000/static/texture/wall1-a-p001.png',
]
// 金属
const imgs2 = [
  'http://localhost:3000/static/matal/1.png',
  'http://localhost:3000/static/matal/2.png',
  'http://localhost:3000/static/matal/3.png',
  'http://localhost:3000/static/matal/4.png',
  'http://localhost:3000/static/matal/5.png',
  'http://localhost:3000/static/matal/6.png',
  'http://localhost:3000/static/matal/7.png',
  'http://localhost:3000/static/matal/8.png',
  'http://localhost:3000/static/matal/9.png',
  'http://localhost:3000/static/matal/10.png',
  'http://localhost:3000/static/matal/11.png',
  'http://localhost:3000/static/matal/12.png',
  'http://localhost:3000/static/matal/13.png',
  'http://localhost:3000/static/matal/14.png',
  'http://localhost:3000/static/matal/15.png',
  'http://localhost:3000/static/matal/16.png',
  'http://localhost:3000/static/matal/17.png',
]
const imgs3 = [
'http://localhost:3000/static/textureEnhancement/1.png',
'http://localhost:3000/static/textureEnhancement/2.png',
]
const texturetype = ref('imgs1')
const imgArr = ref(imgs1)

const switchTextureType = (type) => {
  texturetype.value = type
  switch (type) {
    case 'imgs1':
    imgArr.value = imgs1
      break;
    case 'imgs2':
    imgArr.value = imgs2
      break;
    case 'imgs3':
    imgArr.value = imgs3
      break;
  
    default:
      break;
  }
}
const loadImgBtn = (url) => {
  // const imgDom = document.getElementById(url)

  downloadImage(url)
}
function downloadImage(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const file = new File([blob], 'img.png', {type: 'image/png'})

      emit('uploadFile', file)
    });
}
</script>

<style scoped>
.img_main {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  background: #555;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.img {
  width: 100%;
  cursor: pointer;
  /* height: 100%; */
}
.active {
  background: rgb(171, 212, 193);
}
</style>
