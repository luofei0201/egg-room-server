const Subscription = require('egg').Subscription;

// 房间是否已经被初始化
let roomInited = false;

/**
 * 房间监控服务
 */
class RoomMonitor extends Subscription {

  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '2s', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // 执行定时任务
  async subscribe() {
    //房间未被初始化,则初始化房间
    if (!roomInited) {
      roomInited = true;
      this.ctx.service.room.initRoom();
    }
    // 获取正在心跳的客户
    const heartBeaters = await this.ctx.service.multiQueue.getHeartBeaters()
    for (let i in heartBeaters) {
       const  pushers = heartBeaters[i];
      const timestamp = parseInt(new Date().getTime() / 1000);
       // for (let j in pushers) {
         if (pushers.timestamp < timestamp - 30) {
           console.log("========被踢用户========" + pushers.userId)
           this.ctx.service.multiQueue.cancel(pushers.csId, pushers.userId);
        }
      //}
    }
  }
}

module.exports = RoomMonitor;