<template>
  <div ref="divRef" class="main_flv">
    <!-- <div class="button_input">
      <input type="text" v-model="url">
      <button @click="playerVideo">播放</button>
    </div> -->

    <video
        id="videoElement"
        ref="videoRef"
        autoplay
        muted
        class="videoElement"
      />
    <video
        id="videoElement1aaaa"
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
const initFlvExtend = (url, id) => {
  // const element = document.getElementById('videoElement')
  const element = document.getElementById(id)
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
  width.value = divRef.value.offsetWidth
  height.value = divRef.value.offsetHeight
  // initFlvExtend('http://192.168.1.72:8081/video?port=8091&app=video&stream=192.168.1.19', 'videoElement')
  // setTimeout(() => {
  //   initFlvExtend('http://192.168.1.72:8081/video?port=8091&app=video&stream=192.168.1.129', 'videoElement1aaaa')
  // }, 100)
  initFlvExtend('http://192.168.1.23:8081/video?port=8091&app=video&stream=flv1', 'videoElement')
  setTimeout(() => {
    initFlvExtend('http://192.168.1.23:8081/video?port=8091&app=video&stream=flv2', 'videoElement1aaaa')
  }, 100)
})
const playerVideo = () => {

  initFlvExtend(url.value)
}
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
  width: 50%;
      height: 50%;
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