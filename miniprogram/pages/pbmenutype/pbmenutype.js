// pages/pbmenutype/pbmenutype.js
// 导入配置文件和api
import  Api  from "../../utils/api"
import  Config  from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
      addVal:"",// 要添加的类名
      recipeTypeLists:[], //  所有的类别
      updateVal:"",//要修改的雷鸣
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 调用获取所以类别的方法
    this._getRecipeTypes();
  },

  // 0.获取所有的菜谱分类
  async _getRecipeTypes(){
     let  res =   await Api.findAll( Config.tables.recipeTypeTable );
      //  console.log(res)
      this.setData({
        recipeTypeLists:res.data
      })
  },

  // 1.获取用户输入添加分类的内容
  _addVal(e){
    this.setData({
      addVal:e.detail.value,
    })
  },
  // 2。执行分类添加操作
  async _doAddRecipeType(){
    let typeName =  this.data.addVal; //获取类名
    let types = this.data.recipeTypeLists; //获取所以得类别
    // 判断是否存在？？？ findIndex  返回-1，证明不存在， 非 -1， 索引位置
    let findIndex = types.findIndex((item)=>{
        return  item.typeName == typeName;
    })
    if( findIndex != -1 ){
        // 存在了
        wx.showToast({
          title: '当前类别已经存在了',
          icon:"none",
        })
        return;
    }
    // 执行添加
    let  addres =  await  Api.add( Config.tables.recipeTypeTable , {typeName} ); 
    if(addres._id){
      this._getRecipeTypes();
      wx.showToast({
        title: '添加成功',
      })
      this.setData({
        addVal:"", //清空输入框的内容
      })
    }
  },

  // 3.执行删除操作
  async _removeRecipeType(e){
     let  id =  e.currentTarget.dataset.id;  //获取条件id
      // splice(index,1) 
     let  res  = await  Api.removeById( Config.tables.recipeTypeTable, id );
    // console.log(res,'删除操作')
     if(res.stats.removed == 1){
        wx.showToast({
          title: '删除成功！',
        })
        this._getRecipeTypes()
     }
  },

  // 4.获取要修改的内容
  _getUpdateRecipeType(e){
    let  id =  e.currentTarget.dataset.id;  //获取条件id
    let  allTypes = this.data.recipeTypeLists; //获取所以得类别
    let  types = allTypes.find((item,index)=>{
        return item._id == id;
    })
    this.setData({
      updateVal:types.typeName,  //要修改的默认值
      updateId:types._id, // 要修改的条件
    })
  },
  // 获取要修改的新内容
  _updateVal(e){
    this.setData({
      updateVal:e.detail.value,  //要修改的默认值
    })
  },
  // 执行修改
  async _doUpdateRecipeType(){
      let id = this.data.updateId;  //条件id
      let typeName = this.data.updateVal; //修改的内容

      let  res  = await  Api.updateById( Config.tables.recipeTypeTable, id ,{typeName} )
      if(res.stats.updated == 1){
          wx.showToast({
            title: '修改成功',
          })
          this._getRecipeTypes();
      }
      // console.log(res,'修改')

  }

})