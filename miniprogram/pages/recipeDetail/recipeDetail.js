// pages/recipeDetail/recipeDetail.js
// 导入配置文件和api
import Api from "../../utils/api"
import Config from "../../utils/config"

const _ = Api.db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipe: {}, //菜谱
    isFollows: false, // 当前用户，当前菜谱是否关注 ，默认未关注
  },
  onLoad: function (options) {
    let {
      id,
      recipeName
    } = options;
    // 设置标题
    wx.setNavigationBarTitle({
      title: recipeName,
    })
    this.data.id = id; //不显示页面，可以直接赋值就行；
    this._getRecipeDetail();
  },

  // 获取菜谱详情的方法
  async _getRecipeDetail() {
    let _id = this.data.id; //获取条件id
    let result = await Api.findById(Config.tables.recipeTable, _id);
    // 根据当前菜谱的openid，去用户表中查询对应发布人的信息
    let users = await Api.find(Config.tables.userTable, {
      _openid: result.data._openid
    });
    // console.log(users)
    result.data.userInfo = users.data[0].userInfo;

    // 修改views热度值，每次-1
    let updateViews = await Api.updateById(Config.tables.recipeTable, _id, {
      views: _.inc(1)
    })
    // 操作视图
    result.data.views++;

    // 判断一下，当前菜谱，当前用户是否关注了
    // 查询followTable 
    let where = {
      _openid: wx.getStorageSync('_openid'), //自己的openid
      recipeID: _id
    }
    // 查询
    let followResult = await Api.find(Config.tables.followTable, where)
    // console.log(followResult)
    this.setData({
      recipe: result.data,
      // 如果 关注表中查询的结果数组的长度大于0，证明已经关注该菜谱
      // 反之，没有关注
      isFollows: followResult.data.length > 0 ? true : false
    })
  },
  // 处理关注操作和取消关注操作
  async _followRecipe() {
    console.log('点击关注')
    // 使用缓存中的openid进行判断是否登录
    let _openid = wx.getStorageSync('_openid') || null;
    if (_openid == null) {
      wx.showToast({
        title: '您还未登录，关注请先去登录!',
        icon: "none",
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../personal/personal',
        })
      }, 1500)

      // 未登录
      return;
    }
    // 已经登录了
    // console.log('已经登录')
    if (this.data.isFollows) {
      //取消关注
      // 删除follows表中的对应的数据
      // 删除条件 （删除多条数据，不能再小程序端进行，必须在运行）
      let where = {
        _openid: wx.getStorageSync('_openid'), //自己的openid
        recipeID: this.data.id
      }

      wx.cloud.callFunction({
        name: "remove",
        data: {
          table: Config.tables.followTable,
          where,
        },
        success: async (res) => {
          // console.log(res)
          if (res.result.stats.removed == 1) {
            // 更新 recipr菜谱表中的字段  -1
            let updateViews = await Api.updateById(Config.tables.recipeTable, this.data.id, {
              follows: _.inc(-1)
            })
            wx.showToast({
              title: '已取消关注！',
            })
            this.setData({
              isFollows:false
            })
          }
        }
      })
      // let  removeRes = await  Api.removeByWhere(Config.tables.followTable,where)
      // console.log(removeRes)

    } else {
      // 进行关注
      // recipeID
      // 插入follow表
      let addres = await Api.add(Config.tables.followTable, {
        recipeID: this.data.id
      })
      // 菜谱表更新 follows字段
      let updateViews = await Api.updateById(Config.tables.recipeTable, this.data.id, {
        follows: _.inc(1)
      })

      wx.showToast({
        title: '关注成功！',
      })
      this.setData({
        isFollows: true
      })
    }
  }

})