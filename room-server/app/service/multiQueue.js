'use strict';
const utils = require('../public/utils');

//获取service基类
const Service = require('egg').Service;

/**
 * 队列列表
 */
let queues = {}
/**
 * 心跳信息
 */
let heartBeaters = {}

//创建自己的service类
class MultiQueueService extends Service {

  /**
   *@desc 创建队列
   *@author luofei
   *@date 2018-10-11 16:07:40
   *@return
   */
  async createQueue(csId) {
    //如果队列存在，则不创建
    if (!queues[csId]) {
       queues[csId] = [];
    }
  }

  /**
   *@desc 销毁队列
   *@author luofei
   *@date 2018-10-11 16:07:40
   *@return
   */
  async destroyQueue(csId) {
    //如果队列存在，则销毁
    if (queues[csId]) {
      delete queues[csId]
    }
  }

  async PriorityQueue(userId, csId, priority, status,accessId) {
    let locate = 0;
    let items = [];

    function QueEle(userId, csId, priority,accessId) { //封装我们的元素为一个对象
      this.userId = userId;      //客户id
      this.csId = csId;           //坐席id
      this.priority = priority;  //优先级
      this.queType = 0;          //是否插队标志
      this.pos = 0;              //队列位置
      this.accessId = accessId;              //队列位置
      this.enterTime = new Date();  //进入队列时间
    }

    const queObj = new QueEle(userId, csId, priority,accessId);
    const  isExist = await  this.ctx.service.room.inRoom(csId, userId);
    if ((await this.isEmpty(csId) && status == 3)&&!isExist) { //队列为空,并且状态为就绪,并且不在会话中
      locate = 0
    } else {
      let bAdded = false;
      let isExist = false;
      //items = queues[csId];
      // 队列
      items = await  JSON.parse( await this.ctx.app.redis.get("video-queue_" + csId));
      if (!items) {
        items = [];
      }
      for (var i = items.length - 1; i >= 0; i--) {
        if (priority < items[i].priority&&!bAdded) {
          queObj.queType = 1;
          items.splice(i, 0, queObj); // 循环队列，如果优先级小于这个位置元素的优先级，插入
          bAdded = true;
          locate = i + 1;
          queObj.pos=locate;
          // break;
        }
        if (userId == items[i].userId) {
          isExist = true;
        }
      }
      // 如果循环一圈都没有找到能插队的位置，直接插入队列尾部
      if (!bAdded && !isExist) {
         queObj.pos=items.length;
         items.push(queObj);
      }
      // queues[csId] = items;
      this.ctx.app.redis.set("video-queue_" + csId, JSON.stringify(items))
      //如果不是插队的情况
      if (!bAdded) {
        locate = await this.size(csId);
      }

    }
    console.log("=========队列信息===============" + JSON.stringify(items))
    console.log('当前排队人数===========：', locate);
    return locate;
  }

  //移除队首元素
  async dequeue(csId) {
    let items = JSON.parse(await  this.ctx.app.redis.get("video-queue_" + csId))
    items = items.shift();
    this.ctx.app.redis.set("video-queue_" + csId, JSON.stringify(items))
    return items;
    //return queues[csId].shift();
  }

  //返回队首元素
  async front(csId) {
    const {ctx} = this;
    const items = await  JSON.parse( await  this.ctx.app.redis.get("video-queue_" + csId))
    if (!this.ctx.helper.isEmpty(items)) {
      return items[0];
    }
  }

  //判断当前队列是否为空
  async isEmpty(csId) {
    let items = JSON.parse( await this.ctx.app.redis.get("video-queue_" + csId))
    if (this.ctx.helper.isEmpty(items))
      return true;
    if (items.length === 0) {
      return true;
    } else
      return false;
  };

// 返回当前队列长度
  async size(csId) {
    let items = JSON.parse(await  this.ctx.app.redis.get("video-queue_" + csId))
    if(this.ctx.helper.isEmpty(items)){
      items=[];
    }
    return items.length;
  }

  // 清除当前队列
  clear(csId) {
    this.ctx.app.redis.del("video-queue_" + csId)
  }

  // 返回当前队列中非排队标识队列元素
  async toCallList(csId) {
    var uidtemp = [];
    var items = JSON.parse(await  this.ctx.app.redis.get("video-queue_" + csId))
    if (this.ctx.helper.isEmpty(items))
      return uidtemp;
    for (var i = 0; i < items.length; i++) {
      if (items[i].queType === 0) {
        uidtemp.push(items[i].userId);
      }
    }
    return uidtemp;
  }

  /**
   *@desc 从队列移除
   *@author luofei
   *@date 2018-12-17 16:32:53
   *@params
   *@return
   */
  async shift(csId, userId) {
    // 删除心跳用户
     await  this.delHeartBeat(csId, userId)
     const items = JSON.parse(await  this.ctx.app.redis.get("video-queue_" + csId))
     if (this.ctx.helper.isEmpty(items)){
         this.ctx.service.room.changeStatus(csId, 3);
         return;
     }

     let flag = false;
     const notifyUsers = [];
     for (let i = 0, len = items.length; i < len; i++) {
       if (items[i] && items[i].userId == userId) {
         //delete items[i];
         items.splice(i, 1)
         flag = true
         //break;
       } else {
         if (flag && items[i - 1]) {
           notifyUsers.push(items[i - 1].userId)
         }
       }
     }
     //将房间状态改为就绪
      console.log("=========++========="+JSON.stringify(items))
      console.log("=========++========="+await  this.ctx.service.room.inRoom(csId, userId))
     if(items.length==0&& !await  this.ctx.service.room.inRoom(csId, userId)){
         this.ctx.service.room.changeStatus(csId, 3);
     }


     //回写redis
    console.log("==========csId==========" + csId)
    this.ctx.app.redis.set("video-queue_" + csId, JSON.stringify(items))
     console.log("==========队列取消后==========" + JSON.stringify(items))
     //延后两秒推送人数减少通知排队人数变化
     const self = this;
     console.log("==========通知列表==========" + JSON.stringify(notifyUsers))
     if (notifyUsers.length > 0) {
       setTimeout(function () {
         const msgBody = {data: {code: 0}, desc: "排队人数变化", ext: ""};
         self.ctx.service.im.batchSendUserMsg(notifyUsers, msgBody);
       }, 500)
     }

   }

  /**
   *@desc 取消排队
   *@author luofei
   *@date 2018-09-27 10:18:59
   *@param userId  用户唯一标识
   *@param csId    坐席ID
   *@return
   */
  async cancel(csId, userId) {
    this.shift(csId,userId)
  }

  /**
   *@desc 删除心跳
   *@author luofei
   *@date 2018-12-15 13:17:01
   *@params
   *@return
   */
  async delHeartBeat(csId, userId) {
    const key = csId+"_"+userId;
    if (heartBeaters[key]) {
      delete heartBeaters[key]
    }
   }

  /**
   * 心跳更新
   */
  async setHeartBeat(csId, userId) {
    const {ctx} = this;
    const key = csId+"_"+userId;
    let pusher = heartBeaters[key];
    if (pusher) {
      pusher.timestamp = utils.getTimeStamp()
    } else {
      pusher = {
        userId: userId,
        csId: csId,
        timestamp: utils.getTimeStamp()
      }
    }
    heartBeaters[key]=pusher;
  }

  /**
   *@desc 获取心跳信息
   *@author luofei
   *@date 2018-12-15 13:15:03
   *@params
   *@return
   */
  async getHeartBeaters() {
    return heartBeaters;
  }
}

module.exports = MultiQueueService;
