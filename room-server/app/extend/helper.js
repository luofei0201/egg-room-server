'use strict';
//加载node-uuid模块
const uuid = require('node-uuid');
var redis = require("redis")
//加载crypto库
const crypto = require('crypto');

/**
 *@author you
 *@date 2018-08-16 17:37:19
 *@function 获取用户的唯一标识uuid
 *@params
 *@return {faceUuid}
 */
function execute(ctx) {
  ctx.logger.info('requestHead: %j,requestBody: %j', ctx.request.header, ctx.request.body);
}


module.exports = {

  /**
   *@desc 获取房间管理的redis客户端
   *@author luofei
   *@date 2018-09-26 10:59:05
   *@params
   *@return
   */
  getRoomClient(ctx) {
    const client = ctx.app.redisclient
    //client.select(0)
     return client
  },
  /**
   * @desc 获取排队管理的redis客户端
   *@author luofei
   *@date 2018-09-26 10:59:05
   *@params
   *@return
   */
  getQueueClient(ctx) {
    const client = ctx.app.queueclient
    return client
  },
  /**
   * @desc 获取系统管理的redis客户端
   *@author luofei
   *@date 2018-09-26 10:59:05
   *@params
   *@return
   */
  getSysClient(ctx) {
    const client = ctx.app.redisclient
    client.select(2)
    return client
  },
  isEmpty(item) {
    if(item=='undefined'||item=='null'||item==''||JSON.stringify(item)=='{}')
      return true
    return !item;
  },
  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj=JSON.parse(str);
        if(str.indexOf('{')>-1){
          return true;
        }else{
          return false;
        }

      } catch(e) {
        return false;
      }
    }
    return false;
  },
  /**
   *@desc
   *@author you
   *@date 2018-08-16 17:37:19
   *@function 获取用户的唯一标识uuid
   *@params
   *@return {faceUuid}
   */
  getUuid() {
    //uuid.v1()基于时间戳生成的uuid
    const faceUuid = uuid.v1();
    //uuid.v4()是随机生成的uuid
    //const face1Uuid = uuid.v4();
    return faceUuid.replace(/-/g, "");
  },

  /**
   *@author you
   *@date 2018-08-16 17:36:27
   *@function 将时间戳转化为时间日期格式
   *@params timestamp
   *@return {string}
   */
  getNewTime(timestamp) {
    //这里一定要把时间戳转化成date类型数据
    const date = new Date(timestamp);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
  },

  /**
   *@desc
   *@author you
   *@date 2018-08-17 17:28:27
   *@function 判断对象中的属性所对应的值是否为空
   *@params
   *@return flag
   */
  isEmptyObject(requestBody) {
    let flag = false;
    //遍历对象的键
    for (let key in requestBody) {
      //根据遍历出来的属性值获取对应的值
      let str = requestBody[key];
      if(str == "" || str == null){
        flag=false;
        //如果对象属性所对应的属性为空，则终止循环
        break;
      }else {
        flag = true;
      }
    }
    return flag;
  },
  /**
   *@author you
   *@date 2018-08-27 18:26:38
   *@function 将字符串进行crypto加密
   *@params
   *@return sign
   */
  getCryptoValue(str , method) {
    //将method转化成小写
    const str_method = method.toLowerCase();
    let crypTo = null;
    if (str_method === 'md5') {
      //此时定义md5加密方式
      crypTo = crypto.createHash('md5');
    } else if (str_method === 'sha1') {
      //此时定义sha1加密方式
      crypTo = crypto.createHash('sha1');
    }
    crypTo.update(str);
    //加密后的值sign,此时是32位小写
    const sign = crypTo.digest('hex');
    return sign;
  },
  /**
   *@desc 记录日志
   *@author luofei
   *@date 2018-09-26 10:59:05
   *@params
   *@return
   */
  logger(ctx) {
    //if(ctx.app.config.logger.enable){
       //ctx.logger.info('请求头: %j,请求体: %j', ctx.request.header, ctx.request.body);
    //去掉请求头
    ctx.logger.info('请求体: %j', ctx.request.body);
    //}
  },

  /**
   *@desc 记录异常日志
   *@author you
   *@date 2018-10-10 16:16:03
   */
  errorLog(ctx , e){
    ctx.logger.error(e);
  },

  getJsonArray(arr){
    const jsonStr="[]";
    let jsonArray = eval('('+jsonStr+')');
    //用for循环遍历数据
    for (let i = 0; i<arr.length; i++){
      const data ={
        id:arr[i].id,
        realName:arr[i].realName,
        nickName:arr[i].nickName,
        servTimes:arr[i].servTimes,
        giftCount:arr[i].giftCount,
        likesCount:arr[i].likesCount,
        status:arr[i].status
      };
      jsonArray.push(data);
    }
    return jsonArray;
  },

    /**
     * @desc 发送http请求,只支持GET和POST请求
     * @author liup
     * @date 2018-11-14
     * @param ctx 上下文
     * @param serverUrl 请求路径，以http开头
     * @param methodType 请求类型，GET/POST
     * @param signature 验签
     * @param data 数据包 GET为数据串：参数1=值1&参数2=值2，POST为json数据包：{参数1=值1，参数2=值2}
     * @returns {*}
     */
    async httpUtil(ctx , serverUrl, methodType, signature, data){
    const timestamp = new Date().getTime();
    if(methodType == 'GET'){
        const result = await ctx.curl(serverUrl+'?'+data,{
            contentType: 'json',
            channel:'3',
            timestamp:timestamp,
            signature:signature,
            dataType: 'json',
            });
        return result.data;
    }else if(methodType == 'POST'){
      const result = await ctx.curl(serverUrl, {
            // 必须指定 method
            method: 'POST',
            // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
            contentType: 'json',
            channel:'3',
            timestamp:timestamp,
            signature:signature,
            data: data,
            // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
            dataType: 'json',
            });
        return result.data;
    }else{
        const result = {
          result: {
              'code': '1',
              'result': 'fail！请求类型错误！'
          }
        };
        return result;
    }
  }
}
