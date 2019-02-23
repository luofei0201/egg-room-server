'use strict';

const Controller = require('egg').Controller;

/**
 * 上一次服务编号
 */
let serviceNumber = 0
/**
 *上一次的坐席id
 */
let csId = 0

class RoomController extends Controller {

  /**
   * 创建房间
   * @returns {Promise<void>}
   */
  async createRoom() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
      //记录日志
     ctx.helper.logger(ctx);
    const roomId = ctx.request.body.roomId;
    const roomName = ctx.request.body.roomName;
    if (!roomId) {
      ret.result.code = '1';
      ret.result.message = '房间ID为空';
      return ctx.body = ret;
    } else if (!roomName) {
      ret.result.code = '1';
      ret.result.message = '房间名为空';
      return ctx.body = ret;
    }
    ctx.service.room.createRoom(roomId, roomName);
    ret.result.code = "0";
    ret.result.message = "房间创建成功！";
    ret.data.roomId = roomId;
    ctx.body = ret;
  }

    /**
     * 会话
     * @returns {Promise<void>}
     */
    async session() {
        let ret = {"result": {}, "data": {}};
        const {ctx} = this;
        //记录日志
        ctx.helper.logger(ctx);
        const csId = ctx.request.query.csId;
        if (!csId) {
            ret.result.code = '1';
            ret.result.message = '房间ID为空';
            return ctx.body = ret;
        }
        const session = await ctx.service.room.session(csId);
        ret.result.code = "0";
        ret.result.message = "会话查询成功！";
        ret.data.session = session;
        ctx.body = ret;
    }
  /**
   * 加入房间
   * @returns {Promise<void>}
   */
  async enterRoom() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    //记录日志
    ctx.helper.logger(ctx);
    const roomId = ctx.request.body.roomId;
    const userId = ctx.request.body.userId;
    const openId = ctx.request.body.openId;
      const sessionId = ctx.request.body.sessionId;
    const clientType = ctx.request.body.clientType;
    if (!roomId) {
      ret.result.code = '1';
      ret.result.message = '房间ID为空';
      return ctx.body = ret;
    } else if (!userId) {
      ret.result.code = '1';
      ret.result.message = '用户ID为空';
      return ctx.body = ret;
    } else if (!openId) {
      ret.result.code = '1';
      ret.result.message = 'openId为空';
      return ctx.body = ret;
    }
    ctx.service.room.enterRoom(roomId, userId, openId, clientType,sessionId);
    ret.result.code = "0";
    ret.result.message = "加入房间成功！";
    ret.data.roomId = roomId;
    ctx.body = ret;
  }

  /**
   * 退出房间
   * @returns {Promise<void>}
   */
  async quitRoom() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    ctx.helper.logger(ctx);
    const roomId = ctx.request.body.roomId;
    const userId = ctx.request.body.userId;
    ctx.service.room.quitRoom(roomId, userId);
    ret.result.code = "0";
    ret.result.message = "退出房间成功！";
    ret.data.roomId = roomId;
    ctx.body = ret;

  }

  /*
   销毁房间
   */
  async destroyRoom() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const roomId = ctx.request.body.roomId;
    ctx.service.room.destroyRoom(roomId);
    ctx.service.multiQueue.destroyQueue(roomId);
    ret.result.code = "0";
    ret.result.message = "销毁房间成功！";
    ret.data.roomId = roomId;
    ctx.body = ret;
  }

  /**
   *@desc: 功能描述
   *@author luofei
   *@date 2018-11-16 11:17:05
   *@version v1.0
   */
  async status() {
    //  1-签入，2-签出,3-就绪,4-小休,5.忙碌
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const roomId = ctx.request.query.csId;
    try {
      const status = await  ctx.service.room.status(roomId);
      ret.result.code = "0";
      ret.result.message = "success！";
      ret.data.roomId = roomId;
      ret.data.status = status;
    } catch (e) {
      ret.result.code = '1';
      ret.result.message = '房间不存在';
    }
    ctx.body = ret;
  }

  /**
   * 修改房间状态
   * @returns {Promise<void>}
   */
  async changeStatus() {
    //  1-签入，2-签出,3-就绪,4-小休,5.忙碌
    let ret = {"result": {}, "data": {}};
    const {ctx, service} = this;
    //日志记录
    ctx.helper.logger(ctx);
    const roomId = ctx.request.body.roomId;
    const operType = ctx.request.body.operType;
      if (!roomId) {
          ret.result.code = '1';
          ret.result.message = '房间ID为空';
          return ctx.body = ret;
      } else if (!operType) {
          ret.result.code = '1';
          ret.result.message = '房间状态为空';
          return ctx.body = ret;
      }
      try {
      let status = await  ctx.service.room.status(roomId);
      // 如果坐席为忙碌状态,不能签入和签出
      if (status == 5 && (operType == 1 || operType == 2)) {
        ret.result.code = "0";
        ret.result.message = "坐席正在服务中！";
        ret.data.roomId = roomId;
        ret.data.status = status;

      } else {
        status = await ctx.service.room.changeStatus(roomId, operType);
        const csId = roomId;
        console.log("========status=========" + status)
        //如果为就绪状态,通知队列中用户进入,同时需要排队坐席是否有未保存的小结
        if (status == 3) {
          const session = await ctx.service.room.session(roomId);
          console.log("========会话=========" + JSON.stringify(session))
          //如果房间还有会话,则不通知
          if (!session) {
            let item = await ctx.service.multiQueue.front(roomId);
            console.log("========通知客户=========" + JSON.stringify(item))
            if (item) {
              let msgBody = {
                data: {code: 1, csId: roomId, accessId: item.accessId, startTime: item.enterTime, endTime: new Date()},
                desc: "通知排队用户接入",
                ext: ""
              };
              //推送消息给用户
              var res = await ctx.service.im.sendUserMsg(item.userId, msgBody);
              if (JSON.parse(res).ErrorCode == "0") {
                // 用户出队列
                this.ctx.service.multiQueue.shift(csId, item.userId)
              }
            }
          }

        }
        ret.result.code = "0";
        ret.result.message = "房间状态修改成功！";
        ret.data.roomId = roomId;
        ret.data.status = operType;
      }
    } catch (e) {
      //记录异常日志
      ctx.helper.errorLog(ctx, e);
      ret.result.code = '1';
      ret.result.message = '房间不存在';
    }

    ctx.body = ret;
  }

  /**
   * 房间心跳
   * @returns {Promise<*>}
   */
  async heartbeat() {
    //变量声明
    const ret = {};
    const {ctx} = this;
    const roomId = ctx.request.body.roomId;
    const userId = ctx.request.body.userId;
    //参数验证
    if (!roomId) {
      ret.code = 1;
      ret.message = "roomId为空！";
      return ctx.set(ret);
    } else if (!userId) {
      ret.code = 1;
      ret.message = "userId为空！";
      ctx.body = ret;
    }
    //心跳更新
    ctx.service.room.setHeartBeat(roomId, userId);
    //响应客户端
    ret.code = "0";
    ret.message = "心跳更新成功";
    ctx.body = ret;
  }

  //小结时结束会话
  async endSession() {
    const {ctx, service} = this;
    let ret = {"result": {}, "data": {}};
    //记录日志
    ctx.helper.logger(ctx);
    let reqBody = ctx.request.body;
    const csId = reqBody.csId;
    const userId = reqBody.userId;
    // 如果服务编号是同一个，就不重复推了
    if (serviceNumber == reqBody.serviceNumber && reqBody.csId == csId) {
      ret.result.code = "1";
      ret.result.message = "服务编号重复!";
      ctx.body = ret;
      return
    }
    //参数验证
    if (!csId) {
      ret.code = 1;
      ret.message = "csId为空！";
      return ctx.set(ret);
    } else if (!userId) {
      ret.code = 1;
      ret.message = "userId为空！";
      ctx.body = ret;
    }
    //通知下一个用户接入
    let item = await this.ctx.service.multiQueue.front(csId);
    console.log("============通知客户=============="+JSON.stringify(item))
    // 退出房间
    const room = await ctx.service.room.quitRoom(csId, userId);
      console.log("============房间=============="+JSON.stringify(room))
    // 如果队列里没人,并且无异常会话,并且坐席状态为忙碌,将坐席状态自动改为就绪,表示可以正常接待客户
    if (!room.sessionList[userId] && !item && room.status == 5) {
      ctx.service.room.changeStatus(csId, 3);
    }
    console.log("============================="+room.status)
    if (!item) {
      ret.result.code = "1";
      ret.result.message = "队列没有用户!";
      ctx.body = ret;
      return
    } else if (room.status!=5&&room.status!=3) {
      ret.result.code = "1";
      ret.result.message = "坐席不在就绪状态!";
      ctx.body = ret;
      return
    } else {
      let msgBody = {
        data: {code: 1, csId: csId, accessId: item.accessId, startTime: item.enterTime, endTime: new Date()},
        desc: "排队成功",
        ext: ""
      };
      console.log("==================" + JSON.stringify(msgBody))
      //推送消息给用户
      var res = await this.ctx.service.im.sendUserMsg(item.userId, msgBody);
      if (JSON.parse(res).ErrorCode == "0") {
        //从队列移除
        this.ctx.service.multiQueue.shift(csId, item.userId)
        //响应客户端
        ret.code = "0";
        ret.message = "结束会话成功";
        ctx.body = ret;
      } else {

        //响应客户端
        ret.code = "0";
        ret.message = "结束会话失败";
        ctx.body = ret;

      }
    }
  }
}

module.exports = RoomController;
