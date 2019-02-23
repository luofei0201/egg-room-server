'use strict';

const Controller = require('egg').Controller;



class QueueController extends Controller {
  async index() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const userid = ctx.request.body.userId;
    const csid = ctx.request.body.csId;
    const priority = ctx.request.body.priority;
    const located = await ctx.service.queue.PriorityQueue(userid, csid, priority);

    //const queuesize = ctx.service.queue.size();
    ctx.service.queue.print();
    // const list = ctx.service.queue.toCallList();
    // console.log(list.toString());
    ret.result.code = "0";
    ret.result.message = "排队成功";
    ret.data.queueNum = located
    ctx.body = ret;
    //ctx.set({'recode': '0000','remessage': 'success', 'requeueNum': located});
  }

  //清除所有队列
  async clear() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    await ctx.service.queue.clear();
    ret.result.code = "0";
    ret.result.message = "队列清除成功";
    ctx.body = ret;
  }

  //获取队列大小
  async size() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    ret.data.size = await ctx.service.queue.size();
    ret.result.code = "0";
    ret.result.message = "队列清除成功";
    ctx.body = ret;
  }

  //取消排队
  async cancel() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const userId = ctx.request.body.userId;
    const csId = ctx.request.body.csId;
    await ctx.service.queue.cancel(userId);
    ret.result.code = "0";
    ret.result.message = "取消排队成功";
    ctx.body = ret;
   }
 }
module.exports = QueueController;
