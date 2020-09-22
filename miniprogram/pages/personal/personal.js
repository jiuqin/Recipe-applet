// pages/personal/personal.js
// 导入配置文件和api
import Api from "../../utils/api"
import Config from "../../utils/config"
Page({
  data: {
    isLogin: false, //判断当前用户是否登录
    userInfo: {}, //存储用户信息
    isAdmin: false, //是否为管理员登录
    activeIndex: "0", //选项卡的中间 变量  默认0（菜谱）
    selfRecipeLists: [], //自己发布的菜谱
    recipeTypes:[], // 自己发布的菜谱的分类
    followSelRecipes:[], //自己关注的菜谱
  },
  onShow() {
    // 1.检测是否登录
    this._checkSession();
    this._getInfoByActiveIndex();
  },
  // 2.检测是否登录的函数
  _checkSession() {
    let _this = this; //保存页面this实例
    wx.checkSession({
      success() {
        // 获取缓存信息
        let userInfo = wx.getStorageSync('userInfo')
        let _openid =wx.getStorageSync('_openid');
        let isAdmin = Config.isAdminOpenid == _openid ? true : false;
        // 已经登录
        _this.setData({
          isLogin: true, // 设置登录状态
          userInfo, //设置用户信息
          isAdmin,
        })
      },
      fail() {
        // 还未登录
        wx.showToast({
          title: '登录才能有想不到体验',
          icon: "none"
        })
        _this.setData({
          isLogin: false, //设置未登录状态
        })
      }
    })
  },

  // 3.执行登录
  _login(e) {
    //  console.log(e)
    let _this = this;
    // 用户未同意授权登录
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '请先登录！！',
        icon: "none"
      })
      return;
    }
    // 用户同意授权
    // 1。获取到当前的用户信息 ， 2. _openid 
    wx.login({
      success() {
        // 不要code来换取openid，直接使用云开发函数即可
        wx.cloud.callFunction({
          name: "login", // 云函数的名字，在控制台云函数列表中查询
          async success(res) {
            // console.log(res)
            let _openid = res.result.openid; //获取自己的openid
            let userInfo = e.detail.userInfo; // 获取自己的用户信息

            // 4.查询当前用户是否在用户表中，如果在，直接什么都不做
            let allUsers = await Api.findAll(Config.tables.userTable, {
              _openid
            })
            if (allUsers.data.length <= 0) {
              // 没有
              // 3.先去添加用户信息
              const addres = await Api.add(Config.tables.userTable, {
                userInfo
              })
            }
            //5.判断是为管理员登录
            let isAdmin = Config.isAdminOpenid == _openid ? true : false;
            // 把openid ， userinfo 插入到缓存中
            wx.setStorageSync('_openid', _openid);
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('isAdmin', isAdmin);
            wx.showToast({
              title: '登录成功',
            })
            // 渲染页面 
            _this.setData({
              isLogin: true,
              userInfo,
              isAdmin,
            })
          }
        })

      },
      fail() {
        wx.showToast({
          title: '由于网络原因，登录失败！！！',
          icon: "none"
        })
      }
    })
  },
  // 管理员进行菜谱分类管理页面
  _goRecipeTypePage() {
    if (!this.data.isAdmin) return;
    // if(this.data.isAdmin){
    //   wx.navigateTo({
    //     url: '../pbmenutype/pbmenutype',
    //   })
    // }
    wx.navigateTo({
      url: '../pbmenutype/pbmenutype',
    })


  },
  // 跳转到发布菜谱页面
  _goRecipePage() {
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },

  // 动态改变activeINdex的值
  _changeActiveIndex(e) {
    this.setData({
      activeIndex: e.currentTarget.dataset.index
    }, function () {
      this._getInfoByActiveIndex();
    })
  },

  _getInfoByActiveIndex() {
    let activeIndex = this.data.activeIndex;
    switch (activeIndex) {
      case "0":
        // console.log('获取菜谱')
        // 获取菜谱信息
        this._getSelfRecipes();
        break;
      case "1":
        this._getSelfRecipeType();
        break;
      case "2":
        this._getSelfFollowRecipe()
        break;
      default:
        break;
    }
  },
  // 获取自己发布的菜谱信息
  async _getSelfRecipes() {
    let where = {
      _openid: wx.getStorageSync('_openid'),
      status: 1
    }
    // orderBy={field:"_id",sort:"desc"}
    let orderBy = {
      field: "time",
      sort: "desc"
    };
    let result = await Api.findAll(Config.tables.recipeTable, where, orderBy);

    this.setData({
      selfRecipeLists: result.data
    })


  },
  // 删除菜谱
   _doRemoveRecipe(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let selfRecipeLists =this.data.selfRecipeLists;
    let  _this = this;
    wx.showModal({
      title: "危险提示",
      content: "您确定要删除么?",
      async success(res) {
        // console.log(res)
        if (res.confirm) {
          //执行删除
          let result = await Api.updateById(Config.tables.recipeTable, id, {
            status: 0
          });
          if (result.stats.updated == 1) {
              // 1.不请求数据库，直接在视图上操作
              selfRecipeLists.splice(index,1)
              _this.setData({
                selfRecipeLists
              })

              // _this._getSelfRecipes();
          }
        }
      }
    })

  },
  // 获取自己发布菜谱的分类
  async  _getSelfRecipeType(){
     // let  where = {
      //   _openid,
      //   status:1
      // }
      // // 进行查询自己发布的菜谱
      // let  resultRecipe = await  Api.findAll( Config.tables.recipeTable,where )
    // 获取自己的openid
      let _openid = wx.getStorageSync('_openid');
      // 获取自己发布的菜谱
      let selfRecipeLists = this.data.selfRecipeLists;
      // 获取所以得类别id
      let  typeIds =  selfRecipeLists.map((item)=>{
          return item.recipeTypeId
      })
      // 进行去重
      // new set() 数组去重，返回的不是一个真正的数组
      // Array.from()  转换为真正的数组
      let newTypeIds = Array.from(new Set(typeIds)) ;

      let typeAllPromise = []; //存放所以得分类的数组
      newTypeIds.forEach((item,index)=>{
          let typePromise = Api.findById( Config.tables.recipeTypeTable,item )
          typeAllPromise.push(typePromise)
      })
      let  recipeTypes = await  Promise.all(typeAllPromise)

      // console.log(recipeTypes)
      this.setData({
        recipeTypes,
      })
  },

  // 跳转到菜谱列表页面
  _recipePage(e){
    let {id,title,tag} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })
  },

  // 获取自己关注菜谱信息
  async _getSelfFollowRecipe(){
      //  openid
      let _openid = wx.getStorageSync('_openid');

      let  follows = await  Api.findAll( Config.tables.followTable,{_openid} );
      let  recipeID =  follows.data.map((item)=>{
        return item.recipeID
      })
      // console.log(recipeID)
      let recipeAllPromise = []; //存放所以得分类的数组
      recipeID.forEach((item,index)=>{
          let recipePromise = Api.findById( Config.tables.recipeTable,item)
          recipeAllPromise.push(recipePromise)
      })
      let  recipes = await  Promise.all(recipeAllPromise)
      
      // console.log(recipes)
      this.setData({
        followSelRecipes:recipes
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