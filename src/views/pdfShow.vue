<template>
  <div style="height: 100%;">
    <canvas ref="canvas" id="pdfCanvas"></canvas>
    <!-- <pdf src="http://192.168.1.54:3000/static/pdf/SAP-ME MII介绍_auto.pdf" ></pdf> -->
    <!-- <embed src="http://192.168.1.54:3000/static/pdf/SAP-ME MII介绍_auto.pdf" type="application/pdf" width="100%" height="100%" /> -->
    <!-- <object
  data="http://192.168.1.54:3000/static/pdf/SAP-ME MII介绍_auto.pdf"
  type="application/pdf"
  width="100%"
  height="100%"
></object> -->
<!-- <VueOfficeDocx 
      src="http://192.168.1.54:3000/static/pdf/wordaaa.docx"
      style="height: none;"
      @rendered="rendered"
      ref="docxRef"
  /> -->
  </div>
</template>

<script setup>
// import pdf from 'vue-pdf'
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'
import {ref, onMounted} from 'vue'

// const docxRef = ref()
// const rendered = () => {
//   const elementDiv = document.querySelector('.vue-office-docx')
//   elementDiv.style.height = 'auto'

//   // elementDiv.scrollTo(0, 500)
//   window.scrollTo(0, 500)
//   setTimeout(() => {
//   }, 100)
// }
const canvas = ref()
let currentPage = ref(1)
let pdfDocument = ref()
onMounted(() => {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
  
  // 加载PDF文件
  window.pdfjsLib.getDocument('http://192.168.1.54:3000/static/pdf/SAP-ME MII介绍_auto.pdf').promise.then(function(pdf) {
    pdfDocument = pdf
    // currentPage.value = filePreviewStore.getPageNum
    renderPage(currentPage.value); // 渲染页面
  })
})
// 渲染指定页面
const renderPage = (pageNum) => {
  pdfDocument.getPage(pageNum).then(function(page) {
    var viewport = page.getViewport({scale: 1})
    canvas.value.height = viewport.height
    canvas.value.width = viewport.width

    var renderContext = {
      canvasContext: canvas.value.getContext('2d'),
      viewport: viewport
    }
    page.render(renderContext)
  })
}
</script>

<style lang="scss" scoped>

</style>