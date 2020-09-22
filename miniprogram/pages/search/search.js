// pages/search/search.js
// 导入配置文件和api
import Api from "../../utils/api"
import Config from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
      hotSearch:[], //热门搜索
      jinSearch:[],//近期搜索
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this._getHotSearch();
      this._getJinSearch();// 近期搜索
  },
  async  _getHotSearch(){
      let result  =  await  Api.find( Config.tables.recipeTable, {status:1},7,1,{field:"views",sort:"desc"});

      // console.log(result);
      this.setData({
        hotSearch:result.data
      })
  },
  // 跳转到详情页面
  _goToRecipeDetailPage(e){
    let { id ,recipeName}   = e.currentTarget.dataset;
    // 讲搜索内容  recipename 存入缓存
    // ["123"，“345，”5678“]
    let  search =  wx.getStorageSync('search') || [];
     let  findIndex = search.findIndex((item)=>{
          return item == recipeName;
     })

     if(findIndex ==  -1){
       //不存在
        search.unshift(recipeName) //插入到数组的最前面
     }else{
      //  存在
        search.splice(findIndex,1);
        search.unshift(recipeName) //插入到数组的最前面
     }
     wx.setStorageSync('search', search);
    wx.navigateTo({
      url: '../recipeDetail/recipeDetail?id='+id+"&recipeName="+recipeName,
    })
},
// 获取近期搜索记录
  _getJinSearch(){
      let  jinSearch =  wx.getStorageSync('search') || [];
      this.setData({
        jinSearch,
      })
  },
   // 获取搜索框内容
   _inputVal(e){
    this.setData({
      inputVal:e.detail.value
    })
  },
  // 跳转到菜谱列表页面
  _recipePage(e){
    let {id,title,tag} = e.currentTarget.dataset;
    this.setData({
      inputVal:""
    })
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

    // console.log(id,title,tag)
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })
  },
})