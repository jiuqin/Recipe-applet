// pages/typelist/typelist.js
// 导入配置文件和api
import Api from "../../utils/api"
import Config from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
     recipeTypeLists:[],// 菜谱分类列表
     inputVal:"",
  },
  onLoad: function (options) {
    this._getRecipeTypes()
  },
  // 获取所以得类别
  async _getRecipeTypes(){
    let  result =  await Api.findAll( Config.tables.recipeTypeTable)
    //  console.log(result,4567890)
    this.setData({
      recipeTypeLists:result.data
    })
  },
  // 跳转到菜谱列表页面
  _recipePage(e){
    let {id,title,tag} = e.currentTarget.dataset;
    if(tag != "ptfl"){
      // 讲搜索内容  recipename 存入缓存
      // ["123"，“345，”5678“]
      let  search =  wx.getStorageSync('search') || [];
      let  findIndex = search.findIndex((item)=>{
            return item == title;
      })

      if(findIndex ==  -1){
        //不存在
          search.unshift(title) //插入到数组的最前面
      }else{
        //  存在
          search.splice(findIndex,1);
          search.unshift(title) //插入到数组的最前面
      }
      wx.setStorageSync('search', search);
    }
   

    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })
  },
  // 获取搜索框内容
  _inputVal(e){
    this.setData({
      inputVal:e.detail.value
    })
  },
  
})