// 云函数入口文件
const cloud = require('wx-server-sdk')
// 云端云能力初始化
cloud.init({
  env:"caipu-tnkan"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {
    openid: wxContext.OPENID,
  }
}