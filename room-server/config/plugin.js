'use strict';

// 开启redis插件
exports.redis = {
    enable: true,
    package: 'egg-redis',
};
// 开启mysql插件
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};
//关闭安全
exports.security= {
    enable: false
}
//允许跨域
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
