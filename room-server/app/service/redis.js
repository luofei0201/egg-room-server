'use strict';

//获取service基类
const Service = require('egg').Service;

//创建自己的service类
class redisService extends Service {
  /**
   *@desc 设置
   *@author luofei
   *@date 2018-11-29 20:36:52
   *@params
   *@return
   */
  async set(key, value,format) {
    const {ctx} = this;
    if (ctx.helper.isJSON(JSON.stringify(value)) || Array.isArray(value)) {
      if("JSON"==format){
          value = JSON.stringify(value)
      }
     }
    this.ctx.app.redis.set(key,value)
  }

  /**
   *@desc 获取
   *@author luofei
   *@date 2018-11-29 20:38:30
   *@params
   *@return
   */
  async get(key) {
      return await  this.ctx.app.redis.get(key)
  }

  /**
   *@desc 删除
   *@author luofei
   *@date 2018-11-29 20:38:30
   *@params
   *@return
   */
  async del(key) {
      this.ctx.app.redis.del(key)
  }

  async list(keyMatch) {
    const {ctx} = this;
    const roomList = [];
    return new Promise(function (resolve, reject) {
      const client = ctx.helper.getRoomClient(ctx);
      client.keys(keyMatch + '*', function (err, keys) {
        if (!err) {
          for (let i in keys) {
            roomList[i] = ctx.get;
            /*
            client.get(keys[i], function (err, value) {
               roomList[i] = value;
            })*/
            console.log(JSON.stringify(roomList))
          }
          resolve(roomList)
        } else {
          reject(err)
        }

      });
    })
  }

}

module.exports = redisService;