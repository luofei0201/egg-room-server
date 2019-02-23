'use strict';
const utils = require('../public/utils');
const Service = require('egg').Service
/**
 * 房间列表
 */
let rooms = {}

/**
 * 房间服务
 */
class RoomService extends Service {


  async initRoom() {
    //const  roomList = await db.query("select id,realName,status from CustService")
    //获取请求地址
    const url = this.ctx.app.config.serviceUrl.csUrl;
    //获取请求路径
    const path = this.ctx.app.config.servicePatch.csList;
    //发送请求并返回相应结果
    // const result = await this.ctx.helper.httpUtil(this.ctx , url+path, 'GET', '', 'size=1');
    // const roomList = result.data;
    // for (let i in roomList) {
    //    this.createRoom(roomList[i].id,roomList[i].realName)
    // }
    console.log("================房间初始化完毕======================")
  }

  /**
   * 创建一个房间
   * @param roomId
   * @param roomName
   * @returns {Promise<void>}
   */
  async createRoom(roomId, roomName) {
    var room = {
      roomId: roomId,
      roomName: roomName,
      status: 2, //默认为签出状态
      sessionList: {}  //会话列表
    }
    //初始化房间
    this.ctx.app.redis.set("video-room_" + roomId, JSON.stringify(room))
    //初始化队列
  //  this.ctx.app.redis.set("video-queue_" + roomId, JSON.stringify([]))

    return room;
    //this.ctx.service.redis.set("video-rooms_"+roomId, room)
    //rooms[roomId] = room
  }


  /**
   *@desc 加入房间
   *@author luofei
   *@date 2018-12-20 15:28:23
   *@params
   *@return
   */
  async enterRoom(roomId, userId, openId, clientType,sessionId) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    if (!this.ctx.helper.isEmpty(room)) {
      const session = room.sessionList[userId];
      if (session) {
        session.timestamp = utils.getTimeStamp()
      } else {
        const session = {
          sessionId: sessionId,
          userId: userId,
          roomId: roomId,
          timestamp: utils.getTimeStamp()
        }
        room.sessionList[roomId] = session;
      }
    }
    //rooms[roomId] = room;
    this.ctx.app.redis.set("video-room_" + roomId, JSON.stringify(room))
    //根据openId删除票据信息
    if ("IOS" == clientType || 'ios' == clientType||"iOS" == clientType) {
        // 删除凭据信息
        this.ctx.app.redis.del("queue-ticket-" +  openId)
      // console.log("================删除凭据信息=====================")
      // const param={"openId":openId};
      // //获取请求地址
      // const url = this.ctx.app.config.serviceUrl.userUrl;
      // //获取请求路径
      // const path = this.ctx.app.config.servicePatch.deleteQueueTicket;
      // //发送请求并返回相应结果
      // this.ctx.helper.httpUtil(this.ctx, url + path, 'POST', '', param);
    }
    //生成sessionchage信息
  }

  /**
   * 退出房间
   * @param roomId
   * @param roomName
   * @returns {Promise<void>}
   */
  async quitRoom(roomId, userId) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    if (!this.ctx.helper.isEmpty(room)) {
      delete room.sessionList[roomId];
      this.ctx.app.redis.set("video-room_" + roomId, JSON.stringify(room))
    } else {
      room = {sessionList: {}};
    }
    return room
  }


  /**
   *@desc 会话列表
   *@author luofei
   *@date 2018-12-20 15:32:10
   *@params
   *@return
   */
  async session(roomId) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    if (!this.ctx.helper.isEmpty(room)) {
      return room.sessionList[roomId];
    }
  }

  /**
   *@desc 用户是否在房间中
   *@author luofei
   *@date 2018-12-20 15:32:10
   *@params
   *@return
   */
  async inRoom(roomId, userId) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    console.log("==================" + JSON.stringify(room))
    console.log("==================" + this.ctx.helper.isEmpty(room))
    if (!this.ctx.helper.isEmpty(room)) {
      console.log(room.sessionList[roomId])
      return room.sessionList[roomId]
    }
    return true;
  }


  /**
   * 销毁房间
   * @param roomId
   * @returns {Promise<void>}
   */
  async destroyRoom(roomId) {
    delete rooms[roomId]
  }

  /**
   * 改变房间状态
   * @param roomId
   * @param operType,0-就绪,1-小憩,2-忙碌
   * @returns {Promise<void>}
   */
  async changeStatus(roomId, operType) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    //如果房间不存，则创建一个房间
    if (this.ctx.helper.isEmpty(room)) {
      room = await  this.createRoom(roomId, roomId)
    }
    // 改变房间的状态
    if (!this.ctx.helper.isEmpty(room)) {
      room.status = operType;
      this.ctx.app.redis.set("video-room_" + roomId, JSON.stringify(room))
    }
    //改变坐席的状态
    // this.changeCsStatus(roomId,operType)
    const param = {
      "roomId": roomId,
      "operType": operType
    }
    //获取请求地址
    const url = this.ctx.app.config.serviceUrl.csUrl;
    //获取请求路径
    const path = this.ctx.app.config.servicePatch.changeRoomStatus;
    //发送请求并返回相应结果
    this.ctx.helper.httpUtil(this.ctx, url + path, 'POST', '', param);
    return room.status;

  }


  /**
   * 获取某个坐席的房间状态
   * @param roomId
   * @returns {Promise<void>}
   */
  async status(roomId) {
    let room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    if (this.ctx.helper.isEmpty(room)) {
        room = await  this.createRoom(roomId, roomId)
      //return -1;
    }
    return room.status;
  }

  /**
   * 获取某个坐席的房间状态
   * @param roomId
   * @returns {Promise<void>}
   */
  async getRoom(roomId) {
    const room = JSON.parse(await this.ctx.app.redis.get("video-room_" + roomId));
    if (this.ctx.helper.isEmpty(room)) {
      return {};
    }
    return room;
  }
}

module.exports = RoomService;