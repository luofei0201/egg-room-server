'use strict';

const Controller = require('egg').Controller;
const utils = require('../public/utils');
/**
 * 上一次服务编号
 */
let serviceNumber = 0
/**
 *上一次的坐席id
 */
let csId = 0

class MultiQueueController extends Controller {
  async index() {
    let ret = {"result": {}, "data": {}};
    const {ctx, service} = this;
    //日志记录
    ctx.helper.logger(ctx);
    let reqBody = ctx.request.body;
    const userId = reqBody.userId;
    const csId = reqBody.csId;
    const priority = reqBody.priority;
    if (!userId) {
      ret.result.code = '1';
      ret.result.message = '用户ID为空';
      ctx.body = ret;
      return
    } else if (!csId) {
      ret.result.code = '1';
      ret.result.message = '坐席ID为空';
      ctx.body = ret;
      return
    } else if (!priority) {
      ret.result.code = '1';
      ret.result.message = '优先级为空';
      ctx.body = ret
      return;
    }
    //获取坐席的状态,1-签入，2-签出,3-就绪,4-小休,5.忙碌
    const status = await service.room.status(csId);
    // if (status != '5'&&status != '3') {
    //   ret.result.code = '1';
    //   ret.result.message = '坐席未就绪';
    //   ctx.body = ret;
    //   return
    // }
    // 获取唯一性标识
    const id = utils.getUuid();

    // //如果客户还是房间中,表示正在会话,在应该显示正在转接中
    // const  isExist = await  this.ctx.service.room.inRoom(csId, userId);
    // if (isExist&&status==3) {
    //   ret.result.code = "0";
    //   ret.result.message = "客户还在会话中";
    //   ret.data.queueNum = -1;
    //   ctx.body = ret;
    //   return ;
    // }

    let located = await service.multiQueue.PriorityQueue(userId, csId, priority, status,id);
    //如果不排队,做过小结状态为1
    if (located == 0 && status == 3) {
      ret.data.startTime = new Date();
      ret.data.endTime = new Date();
      //将坐席状态修改为忙碌
      this.ctx.service.room.changeStatus(csId, 5);
    }
    const accessTime = utils.getNewTime(new Date().getTime());
    //删除优先级属性
    delete reqBody.priority;
    reqBody.id = id;
    reqBody.accessTime = accessTime;
    reqBody.accessFlag = '0';
    //调用服务
    try {
      // 获取请求地址
      const url = ctx.app.config.serviceUrl.chatUrl;
      // 获取请求路径
      const path = ctx.app.config.servicePatch.saveAccessInfo;
      // 发送请求并返回相应结果
      const result = ctx.helper.httpUtil(ctx, url + path, 'POST', '', reqBody);
      ret.result.code = "0";
      ret.result.message = "排队成功";
      ret.data.queueNum = located;
      ret.data.accessId = id;
    } catch (e) {
      //记录异常日志
      ctx.helper.errorLog(ctx,e);
      ret.result.code = '1';
      ret.result.message = '排队失败';
      return ctx.body = ret;
    }
    return ctx.body = ret;
  }

  //取消排队
  async cancel() {
    let ret = {"result": {}, "data": {}};
    const {ctx, service} = this;
    //日志记录
    ctx.helper.logger(ctx);
    const reqBody = ctx.request.body;
    const userId = reqBody.userId;
    const csId = reqBody.csId;
    const accessId = reqBody.accessId;
    const accessFlag = reqBody.accessFlag;
    //调用服务
    try {
      if(accessFlag=='2'||accessFlag==2){
         //取消队列
         service.multiQueue.cancel(csId, userId);
      }else{
         console.log("=========++========="+await  service.multiQueue.isEmpty(csId))
          console.log("=========++========="+await  this.ctx.service.room.inRoom(csId, userId))
          if(await  service.multiQueue.isEmpty(csId)&& !await  this.ctx.service.room.inRoom(csId, userId)){
              this.ctx.service.room.changeStatus(csId, 3);
          }
      }
      ret.result.code = "0";
      ret.result.message = "取消排队成功";
      // 获取请求地址
      const url = ctx.app.config.serviceUrl.chatUrl;
      // 获取请求路径
      const path = ctx.app.config.servicePatch.cancelAccessInfo;
      const param = {
        id: accessId,
        accessFlag: accessFlag,
      }
      // 发送请求并返回相应结果
    const result = await  ctx.helper.httpUtil(ctx , url+path, 'POST', '', param);
    } catch (e) {
      //记录异常日志
      ctx.helper.errorLog(ctx);
      ret.result.code = '1';
      ret.result.message = 'fail!';
      return ctx.body = ret;
    }
    return ctx.body = ret;
  }

  //清除某个队列
  async clear() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const csid = ctx.request.body.csId;
    await ctx.service.multiQueue.clear(csid);
    ret.result.code = "0";
    ret.result.message = "队列清除成功";
    ctx.body = ret;
  }

  //获取队列大小
  async size() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const csid = ctx.request.body.csId;
    ret.data.size = await ctx.service.multiQueue.size(csid);
    ret.result.code = "0";
    ret.result.message = "查询成功";
    ctx.body = ret;
  }

  /**
   * 房间心跳
   * @returns {Promise<*>}
   */
  async heartbeat() {
    //变量声明
    const ret={};
    const {ctx} = this;
      //日志记录
      ctx.helper.logger(ctx);
    const roomId = ctx.request.body.roomId;
    const userId = ctx.request.body.userId;
    //参数验证
    if(!roomId){
      ret.code=1;
      ret.message="房间ID为空！";
      ctx.body=ret;
      return
    } else if(!userId){
      ret.code=1;
      ret.message="userId为空！";
      ctx.body=ret;
      return
    }
    //心跳更新
    ctx.service.multiQueue.setHeartBeat(roomId, userId);
    //响应客户端
    ret.code="0";
    ret.message="心跳更新成功";
    //日志记录

    ctx.body=ret;
  }
}
module.exports = MultiQueueController;
