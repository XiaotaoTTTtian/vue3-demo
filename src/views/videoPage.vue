<template>
  <div ref="divRef" class="main_flv">
    <div class="button_input">
      <input type="text" v-model="url">
      <button @click="playerVideo">播放</button>
    </div>

    <video
        id="videoElement"
        ref="videoRef"
        autoplay
        muted
        class="videoElement"
      />
    <!-- <div class="aaaa">
    </div> -->
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import flvjs from 'mpegts.js'

const videoRef = ref(null)
const divRef = ref(null)
const player = ref()

const videoIndex = ref(1)
const initFlvExtend = (url) => {
  const element = document.getElementById('videoElement')
  videoIndex.value += 1
  player.value = flvjs.createPlayer({
    type: 'flv',
    url,
    isLive: true,
    hasAudio: false,
    withCredentials: false
  })
  player.value.attachMediaElement(element)
  player.value.load()
  player.value.play()
  bindPlayerOptions()
}
const bindPlayerOptions = () => {
  videoRef.value.removeEventListener('progress', handleFrameTracking)
  videoRef.value.addEventListener('progress', handleFrameTracking)
  videoRef.value.addEventListener('play', () => {
    update()
  })
}
const handleFrameTracking = () => {
  if (!player.value || !player.value?.buffered.length) return
  try {
        const end = player.value.buffered.end(0) // 获取当前buffered值(缓冲区末尾)
        const delta = end - player.value.currentTime // 获取buffered与当前播放位置的差值
        // 延迟过大，通过跳帧的方式更新视频
        if (delta > 10 || delta < 0) {
          update()
          // this.videoElement.playbackRate = 4
          return
        }

        // 延迟较小时，通过调整播放速度的方式来追帧
        if (delta > 1) {
          videoRef.value.playbackRate = 2
        } else {
          videoRef.value.playbackRate = 1
        }
      } catch (_) {
        //
      }
}
const update = () => {
  if (player.value && player.value.buffered.length) {
    player.value.currentTime = player.value.buffered.end(0) - 1
      }
}
const width = ref(1280)
const height = ref(762)
const url = ref('')
onMounted(() => {
  // const url = window.location.href
  // url.value = `http://${window.location.hostname}:8081/video?port=8091&app=video&stream=flv`
  // const url = 'http://192.168.1.119:8081/video?port=8091&app=video&stream=192.168.1.129'
  width.value = divRef.value.offsetWidth
  height.value = divRef.value.offsetHeight

  // initFlvExtend(url.value)
})
const playerVideo = () => {

  initFlvExtend(url.value)
}
// const destroy = () => {
//   if (this.player) {
//         this.player.pause()
//         this.player.unload()
//         this.player.detachMediaElement()
//         this.player.destroy()
//         this.player = null
//         window.onfocus = null
//       }
// }
// onUnmounted(() => {
//   destroy()
// })
</script>

<style scoped>
.main_flv {
  position: relative;
  /* width: 95vw; */
  /* height: 95vh; */
  width: 100%;
    height: 100%;
}
.main .aaaa {
  width: 100%;
    height: 100%;
  display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
}
.videoElement {
  width: 100%;
      height: 100%;
      /* position: absolute;
      top: 0;
      left: 0; */
}
.button_input {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 100;
}
</style>