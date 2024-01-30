<template>
  <div class="main">
    <div class="nvrbar">
      <div class="item" @click="setRouter('twoVideoPage')">固定地址视频查看</div>
      <div class="item" @click="setRouter('videoPage')">视频查看</div>
      <div class="item" @click="setRouter('threePage')">threejs</div>
      <div class="item" @click="setRouter('knova')">knova</div>
      <div class="item" @click="setRouter('knovaDemo')">knovaDemo</div>
      <div class="item" @click="setRouter('threeShaderMaterial')">threeShaderMaterial</div>
      <div class="item" @click="setRouter('ExcelShow')">ExcelShow</div>
      <div class="item" @click="setRouter('PdfShow')">PdfShow</div>
    </div>
    <div class="content">
      <!-- <component :is="componentNamea" /> -->
      <threePage v-if="componentNamea === 'threePage'" />
      <videoPage v-if="componentNamea === 'videoPage'" />
      <towVideoPage v-if="componentNamea === 'twoVideoPage'" />
      <knovaPage v-if="componentNamea === 'knova'" />
      <knovaDemo v-if="componentNamea === 'knovaDemo'" />
      <threeShaderMaterial v-if="componentNamea === 'threeShaderMaterial'" />
      <ExcelShow v-if="componentNamea === 'ExcelShow'" />
      <PdfShow v-if="componentNamea === 'PdfShow'" />
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import threePage from '../views/threePage.vue'
import videoPage from '../views/videoPage.vue'
import towVideoPage from '../views/towVideoPage.vue';
import knovaPage from '@/views/knovaPage.vue';
import knovaDemo from '@/views/knovaDemo.vue';
import threeShaderMaterial from '@/views/threeShaderMaterial.vue';
import ExcelShow from '@/views/excelShow.vue';
import PdfShow from '@/views/pdfShow.vue';

const locationComponentName = localStorage.getItem('locationComponentName')
// console.log();
const componentNamea = ref(locationComponentName || 'twoVideoPage')
const setRouter = (name) => {
  location.reload()
  localStorage.setItem('locationComponentName', name)
  componentNamea.value = name
  // componentNamea.value = value.replaceAll("'", '')
  // switch (name) {
  //   case 'videoPage':
  //   componentNamea.value = videoPage
  //     break;
  //   case 'threePage':
  //   componentNamea.value = threePage
  //     break;
  //   default:
  //     break;
  // }
}
</script>

<style  scoped>
.main {
  position: relative;
  display: flex;
  height: 97vh;
}
.nvrbar {
  width: 220px;
  background: #ccc;
}
.content {
  position: relative;
  flex: 1;
}
.item {
  padding: 0.3vw;
  background: #195227;
  color: #fff;
  margin: 0.2vw;
  cursor: pointer;
}
</style>