// 1.初始化数据库
const db = wx.cloud.database()

// 1.添加api
const add = (collectionName, data = {}) => {
  // 返回一个promise对象
  return db.collection(collectionName).add({
    data
  });
}
// 2.查询api 
const findById = (collectionName,id="") => {
  return  db.collection( collectionName ).doc(id).get();
}

// 2.根据条件进行查询(分页)
const find = (collectionName,where={},limit=5,page=1,orderBy={field:"_id",sort:"desc"}) => {
  //  skip  跳过几个
  // limit  每页获取几个
    let  skip =  (page -1) * limit;
    return  db.collection(collectionName).where(where).skip(skip).limit(limit).orderBy(orderBy.field,orderBy.sort).get();
}

// 3.根据条件查询
const findAll = async ( collectionName, where={},orderBy={field:"_id",sort:"desc"} ) => {
  const MAX_LIMIT = 20;
  const countResult = await db.collection(collectionName).count()
  const total = countResult.total  //获取数据库的总数据的个数
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 20)  //  2
  // 承载所有读操作的 promise 的数组
  const tasks = []; //用来存储所以得返回的promise对象
  // skip =  (page -  1) * limit 
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy(orderBy.field,orderBy.sort).get()
    // 把所有promise对象都放入数组中
    tasks.push(promise)
  }
  // 当没有数据的时候。直接返回一个和有数据相同数据结构的对象，只不过返回的data是一个空的数组
  if((await Promise.all(tasks)).length <=0){
    // 没有数据的
    return {data:[]};
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

// 4.删除id
const  removeById = ( collectionName,id="")=>{
  return  db.collection( collectionName ).doc(id).remove()
}


// 5.修改  id
const updateById = (collectionName,id="",data={})=>{
  return  db.collection( collectionName ).doc(id).update({data})
}

// 6.根据条件删除 ()
// const  removeByWhere = ( collectionName,where={})=>{
//   return  db.collection( collectionName ).where(where).remove()
// }
export default {
  add,
  findAll,
  removeById,
  updateById,
  find,
  db,
  findById,
  // removeByWhere
}