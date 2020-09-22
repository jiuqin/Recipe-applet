// 导入配置文件和api
import Api from "../../utils/api"
import Config from "../../utils/config"
Page({
  data:{
    hotRecipeLists:[], //  首页4个热门菜谱 views
    recipeTypesList:[], //只获取2个分类
    inputVal:"", //要搜索的内容
  },
  onShow(){
    this._getHotRecipes();
    this._getRecipeType();
  },
  // 获取热门菜谱
  async _getHotRecipes(){
    
    let result =  await Api.find( Config.tables.recipeTable,{status:1},4,1,{field:"views",sort:"desc"} );

    let usersAllPromise = []; //用来存放所以得promise用户对象的
    result.data.forEach((item,index)=>{
      // console.log(item._openid)
        // item._openid
        let usersPromise = Api.find(Config.tables.userTable, {
          _openid: item._openid
        });
      usersAllPromise.push(usersPromise)
    })
    let  users = await  Promise.all( usersAllPromise )
    // 利用map函数，给result.data数据添加新的内容
    result.data.map((item,index)=>{
      item.userInfo = users[index].data[0].userInfo
    })
    
    this.setData({
      hotRecipeLists:result.data
    })
  },
  // 获取首页分类
  async  _getRecipeType(){
     
     let  result =  await Api.find( Config.tables.recipeTypeTable,{},2 )

    //  console.log(result,4567890)
    this.setData({
      recipeTypesList:result.data
    })

  },
  // 进入菜谱分类列表页面
  _goRecipeTypePage(){
      wx.navigateTo({
        url: '../typelist/typelist',
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
  // 获取搜索框内容
  _inputVal(e){
    this.setData({
      inputVal:e.detail.value
    })
  },
  // 跳转到详情页面
  _goToRecipeDetailPage(e){
      let { id ,recipeName}   = e.currentTarget.dataset;
      wx.navigateTo({
        url: '../recipeDetail/recipeDetail?id='+id+"&recipeName="+recipeName,
      })
  }
 
})