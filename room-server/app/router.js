'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // router.get('/', controller.queue.index);
  /*
  //排队
  router.post('/api/v1/video/user/queue', controller.queue.index);
  //清除队列
  router.post('/api/v1/video/user/queue/clear', controller.queue.clear);
  //队列大小
  router.post('/api/v1/video/user/queue/size', controller.queue.size);
  //取消排队
  router.post('/api/v1/video/user/queue/cancel', controller.queue.cancel);
  */
  //用户通知
  router.post('/api/v1/video/user/notify', controller.room.endSession);

  //用户排队
  router.post('/api/v1/video/user/queue', controller.multiQueue.index);
  //清除队列
  router.post('/api/v1/video/user/queue/clear', controller.multiQueue.clear);
  //队列大小
  router.post('/api/v1/video/user/queue/size', controller.multiQueue.size);
  //取消排队
  router.post('/api/v1/video/user/queue/cancel', controller.multiQueue.cancel);

  //im登录
  router.get('/api/v1/im/account/login', controller.im.getLoginInfo);
  //账号导入
  router.post('/api/v1/im/account/import', controller.im.accountImport);
  //添加用户标签
  router.post('/api/v1/im/tag/add', controller.im.addUserTag);
  //消息推送
  router.post('/api/v1/im/msg/push', controller.im.pushUserMsg);
  //批量消息推送
  router.post('/api/v1/im/msg/batchPushUserMsg', controller.im.batchPushUserMsg);
  //同步群漫游消息
  router.post('/api/v1/im/msg/c2c/roams', controller.im.syncC2cRoamMsg);
  //创建房间
  router.post('/api/v1/comm/room/create', controller.room.createRoom);
  //加入房间
  router.post('/api/v1/comm/room/enter', controller.room.enterRoom);
  //退出房间
  router.post('/api/v1/comm/room/quit', controller.room.quitRoom);
  //销毁房间
  router.post('/api/v1/comm/room/destroy', controller.room.destroyRoom);
  //修改房间状态
  router.post('/api/v1/comm/room/changestatus', controller.room.changeStatus);
  //心跳
  //router.post('/api/v1/comm/room/heartbeat', controller.room.heartbeat);
   router.post('/api/v1/comm/room/heartbeat', controller.multiQueue.heartbeat);
  //房间状态
  router.get('/api/v1/video/room/status', controller.room.status);
    //会话信息
    router.get('/api/v1/video/room/session', controller.room.session);

  //==================================redis============================
  //设置
  router.post('/api/v1/redis/set', controller.redis.set);
  //获取
  router.get('/api/v1/redis/get', controller.redis.get);
  //删除
  router.post('/api/v1/redis/del', controller.redis.del);
  //列表
  router.get('/api/v1/redis/list', controller.redis.list);

};
