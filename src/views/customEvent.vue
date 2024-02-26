<template>
  <div>
    {{ showValue }}
    <button @click="hasEvent"> 是否存在事件 </button>
    <button @click="offEcent">注销事件</button>
    <button @click="open">文件上传</button>
    <div> {{ size(memory?.usedJSHeapSize) }} </div>
  </div>
</template>

<script setup>
// import {EventEmit} from '../utils/eventTs.ts'
import {EventEmit} from '../utils/event'
import {onMounted, ref} from 'vue'
import { useFileDialog, useMemory } from '@vueuse/core'

const { files, open, reset, onChange } = useFileDialog()
const { isSupported, memory } = useMemory()
const eventClass = ref(null)
const showValue = ref('')
let index = ref(0)
onMounted(() => {
  eventClass.value = new EventEmit()
  eventClass.value.once('change', changeFun)
  setInterval(() => {
    eventClass.value?.emit('change', 'aaaa')
  }, 1000)

})
const changeFun = (e) => {

  index.value = index.value + 1
  showValue.value = 'event trigger' + index.value
}
const changeFun1 = (e) => {
  index.value = index.value + 1
  showValue.value = 'event trigger' + index.value
}
const hasEvent = () => {
  const res = eventClass.value?.has('change', changeFun)

}
const offEcent = () => {
  eventClass.value?.off('change', changeFun)
}
onChange(files => {

})
function size(v) {
  const kb = v / 1024 / 1024
  return `${kb.toFixed(2)} MB`
}
</script>

<style lang="scss" scoped>

</style>