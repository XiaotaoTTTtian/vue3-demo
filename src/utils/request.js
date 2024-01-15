import axios from 'axios'
export const baseUrl = 'http://192.168.1.120:12000'
axios.defaults.baseURL = baseUrl
// 上传图片
export function uploadimgApi(data) {
  return axios.post('/api/maps/', data)
}

// 获取图片
export function getImgApi(params) {
  return axios.get('/api/maps/', {params});
}