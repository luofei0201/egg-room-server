'use strict';
const Controller = require('egg').Controller;
const {ctx} = this;
class QueueController extends Controller {


  async set() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    let key = ctx.request.body.key;
    let value = ctx.request.body.value;
    let format = ctx.request.body.format;
    ctx.service.redis.set(key,value,format)
    ret.result.code = "0";
    ret.result.message = 'success';
    ctx.body = ret;
  }

  async get() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    let key = ctx.request.query.key;
    const res = await ctx.service.redis.get(key)
    ret.result.code = "0";
    ret.result.message = "success";
    ret.data =res;
    ctx.body = ret;
  }

  async del() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    const res = await ctx.service.redis.del(ctx.request.body.key);
    ret.result.code = "0";
    ret.result.message = res;
    ctx.body = ret;
  }

  async list() {
    let ret = {"result": {}, "data": {}};
    const {ctx} = this;
    let key = ctx.request.query.key;
    const client =  ctx.helper.getRoomClient(ctx);
   const res = await ctx.service.redis.list(ctx.request.query.key);
    console.log("=======列表========="+res)
    ret.result.code = "0";
   ret.result.message = "success";
    ret.result.data = res;
    ctx.body = ret;
  }

}

module.exports = QueueController;
