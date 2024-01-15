<template>
  <div
    style="width: 500px; height: 500px; background-color: #ddd"
    class="rc-cropper"
  >
    <!-- <div id="knovaDivId" style="width: 500px;height: 500px;background-color: antiquewhite;"></div>
    <button @click="loadImg">加载图片</button>
    <button @click="clipImg">裁剪图片</button> -->
    <div @click="imgUploadBtn">图片上传</div>
    <img
      id="image"
      src=""
      style="width: 500px; height: 500px; display: block"
    />
    <div class="rc-cropper__iconCrop1">
      <button @click="affirmClipImg">确认裁剪</button>
      <button @click="clipImg">保存</button>
    </div>
    <input type="file" @change="fileChange" id="fileImg" />
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import knovaImgClip from '../utils/imageclip'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

const canvasInstance = ref()
const cropper = ref()
onMounted(() => {
  // canvasInstance.value = new knovaImgClip({
  //   canvasId: 'knovaDivId',
  //   width: 500,
  //   height: 500,
  // })
  // const image = document.getElementById('image');
  // cropper.value = new Cropper(image, {
  //   aspectRatio: 1 / 1,
  //   checkCrossOrigin: true,
  //   viewMode: 2,
  // });
  drawImage()
})
const clipImg = () => {
  console.log(cropper.value)
}
const drawImage = () => {
  const image = document.getElementById('image')
  cropper.value = new Cropper(image, {
    aspectRatio: 1 / 1,
  })
}
const affirmClipImg = () => {
  if (!cropper.value.cropped) {
    console.log(1111)
    return
  }
  cropper.value.getCroppedCanvas().toBlob((blob) => {
    console.log(blob)
    const href = window.URL.createObjectURL(blob)
    const image = document.getElementById('image')
    image.src = href
    console.log(href)
    drawImage()
  }, 'image/png')
  cancelCropper()
}
const cancelCropper = () => {
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
  }
}
const fileChange = (e) => {
  console.log(e.target.files[0])
  const file = e.target.files[0]

  if (!file.type.includes('image/')) {
    alert('Please select an image file')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    cropper.value.replace(event.target.result)
  }

  reader.readAsDataURL(file)
}
const imgUploadBtn = () => {
  document.getElementById('fileImg')?.click()
}
</script>

<style lang="scss" scoped></style>
