'use strict';
const Controller = require('egg').Controller;
const ImMgr = require('../public/im_mgr');
class ImController extends Controller {
  /**
   *@desc IM登陆
   *@author luofei
   *@date 2018-09-27 15:52:32
   *@return
   */
  async getLoginInfo() {
    const { ctx } = this;
    const ret = { result: {}, data: {} };
    const userId = ctx.request.query.userId;
    ret.data.sdkAppId = ctx.app.config.im.sdkAppId;
    ret.data.userId = userId;
    ret.data.userSig = ImMgr.getSig(ctx, userId);
    ret.data.accountType = ctx.app.config.im.accountType;
    ret.data.sdkAppId = ctx.app.config.im.sdkAppID.toString();
    ret.result.code = '0';
    ret.result.message = '登录成功!!';
    ctx.body = ret;
  }

  /**
   * 账号导入
   * @return {Promise<void>}
   */
  async accountImport() {
    const { ctx } = this;
    // 参数处理
    const ret = { result: {}, data: {} };
    const userId = ctx.request.body.userId;
    const nickName = ctx.request.body.nickName;
    const headUrl = ctx.request.body.headUrl;
    // 业务逻辑处理
    const resp = await ctx.service.im.accountImport(userId, nickName, headUrl);
    // 报文封装
    if (JSON.parse(resp).ErrorCode == 0) {
      ret.result.code = '0';
      ret.result.message = '账号导入成功';
    } else {
      ret.result.code = '1';
      ret.result.message = '账号导入失败';
    }
    // 日志记录
    ctx.body = ret;
  }

  /**
   * 添加用户标签
   * @return {Promise<void>}
   */
  async addUserTag() {
    const { ctx } = this;
    const ret = { result: {}, data: {} };
    const userId = ctx.request.body.userId;
    const resp = await ctx.service.im.addUserTag(userId);
    if (JSON.parse(resp).ErrorCode == 0) {
      ret.result.code = '0';
      ret.result.message = '用户标签添加成功!!';
    } else {
      ret.data.message = '用户标签添加失败:' + JSON.parse(resp).ErrorInfo;
    }
    ctx.body = ret;
  }




  /**
   * 消息推送
   * @returns {Promise<void>}
   */
  async batchPushUserMsg() {
    const {ctx} = this;
    let ret={"result":{},"data":{}};
    const userIds = ctx.request.body.userIds;
    const msgBody = ctx.request.body.msgBody;
    const resp= await ctx.service.im.batchSendUserMsg(userIds,msgBody);
    console.log("==========消息推送==========")
    if(JSON.parse(resp).ErrorCode==0){
      ret.result.code= "0";
      ret.result.message="消息推送成功!!";
      ret.data.taskId=JSON.parse(resp).TaskId
      console.log("==============="+JSON.stringify(ret));
    }else{
      ret.result.code= "1";
      ret.result.message="消息推送失败:"+JSON.parse(resp).ErrorInfo+JSON.parse(resp).ErrorCode;
      console.log("==============="+JSON.stringify(ret));

    }
    ctx.body = ret
  }

  /**
   * 消息推送
   * @return {Promise<void>}
   */
  async pushUserMsg() {
    const { ctx } = this;
    const ret = { result: {}, data: {} };
    const userId = ctx.request.body.userId;
    const msgBody = ctx.request.body.msgBody;
    const resp = await ctx.service.im.sendUserMsg(userId, msgBody);
    if (JSON.parse(resp).ErrorCode == 0) {
      ret.result.code = '0';
      ret.result.message = '消息推送成功!!';
      ret.data.taskId = JSON.parse(resp).TaskId;

    } else {
      ret.result.code = '1';
      ret.result.message = '消息推送失败:' + JSON.parse(resp).ErrorInfo;
      console.log('===============' + JSON.stringify(ret));

    }
    ctx.body = ret;
  }

  /**
   * 同步c2c漫游消息
   * @return {Promise<void>}
   */
  async syncC2cRoamMsg() {
    const { ctx } = this;
    const ret = { result: {}, data: {} };
    const groupId = ctx.request.body.groupId;
    const reqNum = ctx.request.body.reqNum;
    const resp = await ctx.service.im.syncC2cRoamMsg(groupId, reqNum);
    if (JSON.parse(resp).ErrorCode == 0) {
      ret.result.code = '0';
      ret.result.message = '漫游消息同步成功!';
      ret.data.msgList = JSON.parse(resp).RspMsgList;
    } else {
      ret.result.code = '1';
      ret.result.message = '漫游消息同步失败:' + JSON.parse(resp).ErrorInfo;
    }
    ctx.body = ret;
  }


}

module.exports = ImController;
