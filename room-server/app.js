'use strict'
const egg = require('egg');
var redis = require("redis")



// const workers = Number(process.argv[2] || require('os').cpus().length); // 获取cup数量
egg.startCluster({
  workers: 1,
  baseDir: __dirname,
  port: 8082,
});

module.exports = app => {
  //连接内存库
  // const client = redis.createClient("6379","127.0.0.1",{db:0})
  // client.auth("123456");
  // app.redisclient=client;
  //排队
 // client.select(1)
  /*
  const  queueclient = redis.createClient("6379","127.0.0.1",{db:1})
  client.auth("123456");
   app.queueclient=queueclient;
   */
  //系统
 // client.select(2)
  //app.sysclient=client;

};

