'use strict';
const ImMgr = require('../public/im_mgr');
const request = require('request')
const Service = require('egg').Service;
const host = 'https://console.tim.qq.com/';

/**
 * IM服务
 */
class ImService extends Service {
  /**
   * 设置用户标签
   * @param userId
   * @returns {Promise<void>}
   */
  async addUserTag(userId) {
    const {ctx} = this;
    const data = {
      "UserTags": [
        {
          "To_Account": userId,
          "Tags": [userId]
        }
      ]
    }
    const myreq = {
      url: host + 'v4/openim/im_add_tag' + ImMgr.getQueryString(ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 通过用户标签推送消息
   */
  async sendUserMsg (userID,msgBody) {
    //记录日志
    this.ctx.logger.info('推送目标: %j 推送参数: %j', userID,msgBody);
    /*
    if(msgBody.data.code=='20' || msgBody.data.code==20){
       return JSON.stringify({"ErrorInfo":"消息推送频率过高","ErrorCode":1});
    }*/
    var random=(((1 + Math.random()) * 0x10000) | 0);
    var data ={
      "SyncOtherMachine": 2,//消息不同步至发送方
      "To_Account": userID,
      "MsgLifeTime":0, //消息不保存
      "MsgRandom": random,
      "MsgBody": [
        {
          "MsgType": "TIMCustomElem",
          "MsgContent": {
            "Data":JSON.stringify(msgBody.data),
            "Desc": msgBody.desc,
            "Ext":  msgBody.ext
          }
        }
      ]
    }
    var myreq = {
      url: host + 'v4/openim/sendmsg' +ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 批量发送消息
   */
  async batchSendUserMsg (userIds,msgBody) {
    //记录日志
    this.ctx.logger.info('推送目标: %j 推送参数: %p', userIds,msgBody);

    var random=(((1 + Math.random()) * 0x10000) | 0);
    var data ={
      "SyncOtherMachine": 2,//消息不同步至发送方
      "To_Account": userIds,
      "MsgLifeTime":0, //不报存笑嘻嘻
      "MsgRandom": random,
      "MsgBody": [
        {
          "MsgType": "TIMCustomElem",
          "MsgContent": {
            "Data":JSON.stringify(msgBody.data),
            "Desc": msgBody.desc,
            "Ext":  msgBody.ext
          }
        }
      ]
    }
    var myreq = {
      url: host + 'v4/openim/batchsendmsg' +ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 批量通知
   */
  async batchNotify (userIds,msgBody) {
    //记录日志
    this.ctx.logger.info('推送目标: %j 推送参数: %p', userIds,msgBody);

    var random=(((1 + Math.random()) * 0x10000) | 0);
    var data ={
      "SyncOtherMachine": 2,//消息不同步至发送方
      "To_Account": userIds,
      "MsgLifeTime":0, //不保存消息
      "MsgRandom": random,
      "MsgBody": [
        {
          "MsgType": "TIMCustomElem",
          "MsgContent": {
            "Data":JSON.stringify(msgBody.data),
            "Desc": msgBody.desc,
            "Ext":  msgBody.ext
          }
        }
      ]
    }
    var myreq = {
      url: host + 'v4/openim/batchsendmsg' +ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   *@desc: 保存消息推送记录
   *@author luofei
   *@date 2018-11-05 14:57:38
   *@version v1.0
   */
  async saveMsgRecord(userId, msgBody) {

  }
  /**
   * 推送用户消息
   * @param userId
   * @returns {Promise<void>}
   */
  async pushUserMsg(userId, msgBody) {
    var random = (((1 + Math.random()) * 0x10000) | 0);
    var data = {
      "MsgRandom": random,
      "Condition": {
        "TagsOr": [userId]
      },
      "MsgBody": [
        {
          "MsgType": "TIMCustomElem",
          "MsgContent": {
            "Data": JSON.stringify(msgBody.data),
            "Desc": msgBody.desc,
            "Ext":  msgBody.ext
          }
        }
      ]
    };
    var myreq = {
      url: host + 'v4/openim/im_push' + ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }


    return new Promise(function (resolve, reject) {
      setTimeout(function(){
        request.post(myreq, function (error, rsp, body) {
          if (!error && rsp.statusCode == 200) {
            resolve(body)
          } else {
            reject(error)
          }
        })
      },1000)

    })
  }


  /**
   * 推送用户消息(批量)
   * @param userIds 用户数组
   * @returns {Promise<void>}
   */
  async batchPushUserMsg(userIds, msgBody) {

    var random = (((1 + Math.random()) * 0x10000) | 0);
    var data = {
      "MsgRandom": random,
      "Condition": {
        "TagsOr": userIds
      },
      "MsgBody": [
        {
          "MsgType": "TIMCustomElem",
          "MsgContent": {
            "Data": JSON.stringify(msgBody.data),
            "Desc": msgBody.desc,
            "Ext":  msgBody.ext
          }
        }
      ]
    };
    var myreq = {
      url: host + 'v4/openim/im_push' + ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }




  /**
   * 账号导入
   * @param userId
   * @returns {Promise<any>}
   */
  async accountImport(userId, nickName, headUrl) {
    const {ctx} = this;
    const data = {
      "Identifier": userId
    };
    if(nickName){
      data.Nick=nickName;
    }
    if(headUrl){
      data.FaceUrl=headUrl;
    }

    const myreq = {
      url: host + 'v4/im_open_login_svc/account_import' + ImMgr.getQueryString(ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 批量账号导入
   * @param userId
   * @returns {Promise<any>}
   */
  async batchAccountImport(userId, nickName, headUrl) {
    const {ctx} = this;
    var random = (((1 + Math.random()) * 0x10000) | 0);
    var data = {
      "Identifier": userId
    };
    if(nickName){
      data.Nick=nickName;
    }
    if(headUrl){
      data.FaceUrl=headUrl;
    }

    var myreq = {
      url: host + 'v4/im_open_login_svc/account_import' + ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }

    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 同步房间漫游消息
   * @param rommId
   * @returns {Promise<any>}
   */
  async syncC2cRoamMsg(groupId,msgNum) {
    var data ={
      "GroupId": groupId,
      "ReqMsgNumber": msgNum
    };
    var myreq = {
      url: host + 'v4/group_open_http_svc/group_msg_get_simple' + ImMgr.getQueryString(this.ctx),
      form: JSON.stringify(data)
    }
    return new Promise(function (resolve, reject) {
      request.post(myreq, function (error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }
}

module.exports = ImService;
