<template>
  <div>
    <div id="example"></div>
    <img :src="url" alt="" style="width: 1000px;height: 1000px;">
    <!-- <div v-html="htmlData"></div> -->
  </div>
</template>

<script setup>
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import {onMounted} from 'vue'
import {getExcelDataApi} from '@/utils/request'
import {ref} from 'vue'
import * as XLSX from 'xlsx'

// const htmlData = ref<any>(null)
const url = ref('')
const init = () => {
  const container = document.querySelector('#example');
  const hot = new Handsontable(container, {
    // data,
    data: [
      ['', 'Tesla', 'Volvo', 'Toyota', 'Ford'],
      ['2019', 10, 11, 12, 13],
      ['2020', 20, 11, 14, 13],
      ['2021', 30, 15, 12, 13]
    ],
    rowHeaders: true,
    colHeaders: true,
    
    licenseKey: 'non-commercial-and-evaluation' // for non-commercial use only
  });
}
const formatExcelData =async () => {
  const {data} = await getExcelDataApi()
  const reader = new FileReader()
  reader.readAsDataURL(data)
  reader.onload = (e) => {
    const filePath = e.target.result
    url.value = filePath
    // init(data)
  }
  console.log(data);
}
const loadxcel = (blob) => {
  const wb = XLSX.read(blob)

} 
onMounted(async () => {
  // init()
  // formatExcelData()
})

</script>

<style lang="scss" scoped>

</style>