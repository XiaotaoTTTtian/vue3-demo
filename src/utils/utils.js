import {baseUrl} from './request'
// 获取生成图片的路径
export const getFourImgUrl = (data) => {
  return {
    diffuseMap: `${baseUrl}/${data[1]}`,
    normalMap: `${baseUrl}/${data[0]}`,
    roughnessMap: `${baseUrl}/${data[2]}`,
    // specularMap: 'http://192.168.1.54:3000/static/img/15.png',
    specularMap: `${baseUrl}/${data[3]}`,
  }
}