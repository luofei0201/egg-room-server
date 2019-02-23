'use strict'
const egg = require('egg');


module.exports = app => {
  console.log("===========初始化111=============")
  // const client = redis.createClient("6379","127.0.0.1")
  // client.auth("123456");
  // client.select(0)
  // app.redis.room=client;
};

module.exports = app => {
  console.log("===========初始化22=============")
  app.cache = new Cache();
};

// const workers = Number(process.argv[2] || require('os').cpus().length); // 获取cup数量
egg.startCluster({
  workers: 1,
  baseDir: __dirname,
  port: 8082,
});
