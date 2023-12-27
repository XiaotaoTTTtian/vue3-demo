export const generateId = () => {
  let value = +new Date()
  value = Math.floor(value / 1000) + ''
  value = Number(value.slice(-6)) + Math.floor(Math.random() * 100)
  return value
}