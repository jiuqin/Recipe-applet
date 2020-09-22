// pages/pbmenu/pbmenu.js
// 导入配置文件和api
import  Api  from "../../utils/api"
import  Config  from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
      recipeTypeLists:[], //所有的分类
      files:[], // 是所有上传的图片（显示出来）[{url:"XXX.jog"},{url:"xxx.jpg"}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getRecipeTypes()
  },
  // 1.获取所有的分类
  async _getRecipeTypes(){
    let  res =   await Api.findAll( Config.tables.recipeTypeTable );
     //  console.log(res)
     this.setData({
       recipeTypeLists:res.data
     })
 },
  //2.选择图片  
 _bindselectImage(e){
    // console.log(e)
    let  tempFilePaths =  e.detail.tempFilePaths; //获取图片临时路径
    console.log(tempFilePaths,'tempFilePaths')
    // [{url:"XXX.jog"},{url:"xxx.jpg"}]
    let files = tempFilePaths.map((item)=>{
        return  {url:item};
    })
    // console.log(files)
    files = this.data.files.concat(files)  //拼接
    this.setData({
      files,
    })

 },
//  3.删除图片

 _deleteImage(e){
    // console.log(e)
    let  index = e.detail.index; //获取要删除的索引
    let  files  = this.data.files;
    files.splice(index,1); //删除当前图片
    this.setData({
      files,
    })
 },
//  发布菜谱
 async _doRecipes(e){
    // console.log(e)
    // 获取菜谱信息
    let {recipeName,recipeTypeId,recipeMakes} = e.detail.value;
    if(recipeName =="" ||recipeTypeId=="" || recipeMakes=="" ||this.data.files.length <= 0 ){
      wx.showToast({
        title: '请补全信息!!',
        icon:"none"
      })
      return;
    }
    // fields  图片的上传路径
    const fields = await this._uploaderFile(this.data.files);
    let data = {
      follows:0,views:0,status:1,time:new Date().getTime(),recipeName,recipeMakes,recipeTypeId,fields
    }
    // 执行添加
    let  result =  await  Api.add( Config.tables.recipeTable,data );

    // console.log(result,'插入成功')
    if(result._id){
      wx.showToast({
        title: '菜谱发布成功',
      })
      setTimeout(()=>{
         wx.navigateBack({
           delta: 1,
         })
      },1500)
    }
 },

  //多图文件上传
  async _uploaderFile(files){
      // [{url:"xxx"},{url:"xxx"}]
      let  allFilesPromise = []; // 全部的promise对象
      files.forEach((item,index)=>{
          let  extName = item.url.split('.').pop(); //获取拓展名
          let fileName = new  Date().getTime()+'_'+index+'.'+extName; //文字
          let promise = wx.cloud.uploadFile({
            cloudPath: "c-recipes/"+fileName, // 上传至云端的路径
            filePath: item.url, // 小程序临时文件路径
          });
          console.log(promise,'promise');
          allFilesPromise.push( promise )

      })
      let res=await  Promise.all( allFilesPromise );
      console.log(res,'PromiseALL')
       return  await  Promise.all( allFilesPromise )
      

  }

})