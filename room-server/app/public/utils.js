'use strict';
//加载node-uuid模块
const uuid = require('node-uuid');

/**
 *@desc 通过uuid获取唯一性标识
 *@author you
 *@date 2018-11-05 15:44:47
 *@params
 */
function getUuid() {
  //uuid.v1()基于时间戳生成的uuid
  const faceUuid = uuid.v1();
  //uuid.v4()是随机生成的uuid
  //const face1Uuid = uuid.v4();
  return faceUuid.replace(/-/g, "");
}

/**
 *@author you
 *@date 2018-08-16 17:36:27
 *@function 将时间戳转化为时间日期格式
 *@params timestamp
 *@return {string}
 */
 function getNewTime(timestamp) {
  //这里一定要把时间戳转化成date类型数据
  const date = new Date(timestamp);
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}
/**
 *@desc 记录异常日志
 *@author you
 *@date 2018-10-10 16:16:03
 */
function errorLog(ctx , e){
  ctx.logger.error(e);
}
/**
 *@desc 获取时间戳
 *@author you
 *@date 2018-11-05 15:21:48
 */
function getTimeStamp () {
  const date = new Date();
  return parseInt(date.getTime() / 1000);
}

module.exports = {
  getTimeStamp,
  getUuid,
  getNewTime,
  errorLog
}

