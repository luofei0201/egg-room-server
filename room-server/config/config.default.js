'use strict';

module.exports = appInfo => {

  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1535521850945_2299';
  // redis
    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: 'xxxxxxxxxx',   // Redis host
            password: 'xxxxxx',
            db: 0,
        },
    }
  // config.redis = {
  //   client: {
  //     port: 6379,          // Redis port
  //     host: 'r-j5ed4dde8020b314.redis.rds.aliyuncs.com',   // Redis host
  //     password: 'Kzgm2018',
  //     db: 0,
  //   },
  // }
  // add your config here
  config.middleware = [];
  config.im = {
    /**
     *  云通信 sdkAppID: accountType 和 privateKey 是云通信独立模式下，为您的独立账号 identifer，
     *  派发访问云通信服务的userSig票据的重要信息，填写错误会导致IM登录失败，IM功能不可用
     */
    sdkAppID: 111111111,
    /**
     *  云通信 账号集成类型 accountType: sdkAppID 和 privateKey 是云通信独立模式下，为您的独立账户identifer，
     *  派发访问云通信服务的userSig票据的重要信息，填写错误会导致IM登录失败，IM功能不可用
     */
    accountType:  "xxxxxxxxxxxxxx",
    //accountType: "29533",
    // 云通信 管理员账号
    administrator: "xxxxxxxxxxx",
    /**
     *  云通信 派发usersig 采用非对称加密算法RSA，用私钥生成签名。privateKey就是用于生成签名的私钥，私钥文件可以在互动直播控制台获取
     *  配置privateKey
     *  将private_key文件的内容按下面的方式填写到 privateKey字段。
     */
    privateKey: 'xxxxxxxxxxxxxxxxx',
    /**
     * 云通信 验证usersig 所用的公钥
     */
    publicKey: 'xxxxxxxxxxxxxxxxx'
  }

  //配置后台服务请求路径参数
  config.servicePatch = {
    // 请求接入
    saveAccessInfo: '/api/v1/video/user/access',
    // 取消接入
    cancelAccessInfo: '/api/v1/video/user/access/cancel',
    // 改变坐席状态
    changeRoomStatus: '/api/v1/video/cs/status/change',
    // 坐席列表
    csList: '/api/v1/video/cs/list',
    // 删除排队凭据信息
    deleteQueueTicket:'/api/v1/video/user/cs/deleteQueueTicket',

  };

  //心跳超时时间,以秒为单位
  config.room = {
    heartBeatTimeout: 2
  }

  return config;
};
