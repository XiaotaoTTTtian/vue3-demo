<template>
  <div style="width: 300px;height: 340px;">
    <img id="image" src="http://192.168.1.54:3000/static/img/1.png" alt="Picture" >
    <div id="cropper-container" style="width: 100%;height: 100%;"></div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import Cropper from 'cropperjs';

const init = () => {
  const imgDom = document.getElementById('image')
  const cropper = new Cropper(imgDom, {
    aspectRatio: 1 / 1,
    // container: '#cropper-container'
  });
  // const cropper = new Cropper(imgDom);
}
onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>

</style>