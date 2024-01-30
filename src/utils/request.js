import axios from 'axios'
export const baseUrl = 'http://192.168.1.27:9091'
axios.defaults.baseURL = baseUrl
// 上传图片
export function uploadimgApi(data) {
  return axios.post('/api/maps/', data)
}

// 获取图片
export function getImgApi(params) {
  return axios.get('/api/maps/', {params});
}
// 
export function getExcelDataApi(params) {
  // return axios.get('/api/dialogue/findDocumentDetail', {params});
  return axios({
    url: '/api/dialogue/findDocumentDetail',
    method: 'get',
    params: {
      docName: 'example.xlsx',
      page: 1
    },
    headers: {
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MDcxODczNzEsInVzZXJJZCI6IjE3IiwidXNlcm5hbWUiOiJsaXV5eiJ9.yLjnZrGY30wCkxNRlexMzXle0Yek6_IhhQGfIyn_kj0'
    },
    responseType: 'blob'
  })
}