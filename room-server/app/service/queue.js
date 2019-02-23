'use strict';

//获取service基类
const Service = require('egg').Service;
var items = [];

//创建自己的service类
class queueService extends Service {
  async PriorityQueue(userId, csId, priority) {
    var locate = 0;

    function QueEle(userId, csId, priority) { //封装我们的元素为一个对象
      this.userId = userId; //客户id
      this.csId = csId; //坐席id
      this.priority = priority; //优先级
      this.queType = 0; //是否插队标志
    }

    var queObj = new QueEle(userId, csId, priority); //创建队列元素对象
    console.log(queObj.userId);
    if (this.isEmpty()) { //如果队列是空的，直接插入
      console.log('is empty', this.size());
      items.push(queObj);
      locate = 1;
    } else {
      console.log('is not empty', this.size());
      var bAdded = false;
      for (var i = 0, len = items.length; i < len; i++) {
        if (priority < items[i].priority) {
          queObj.queType = 1;
          items.splice(i, 0, queObj); // 循环队列，如果优先级小于这个位置元素的优先级，插入
          bAdded = true;
          locate = i + 1;
          break;
        }
      }
      if (!bAdded) {
        items.push(queObj); // 如果循环一圈都没有找到能插队的位置，直接插入队列尾部
        locate = this.size();
      }
    }
    console.log('当前排队人数：', locate);
    return locate;
  }

//移除队首元素
  dequeue() {
    return items.shift();
  }

  //返回队首元素
  front() {
    return items[0];
  }

  //判断当前队列是否为空
  isEmpty() {
    if (items.length === 0) {
      return true;
    } else
      return false;
  };

// 返回当前队列长度
  size() {
    return items.length;
  }

  // 清除当前队列
  clear() {
    items = [];
  }

  // 日志打印队列排队情况
  print() {
    var uidtemp = [];
    var quetypetemp = [];
    for (var i = 0, len = items.length; i < len; i++) {
      uidtemp.push(items[i].userId);
      quetypetemp.push(items[i].queType);
    }
    console.log('排队uid', uidtemp.toString());
    //console.log('插队情况', quetypetemp.toString());
  }

  // 返回当前队列中非排队标识队列元素
  toCallList() {
    var uidtemp = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].queType === 0) {
        uidtemp.push(items[i].userId);
      }
    }
    return uidtemp;
  }

  /**
   *@desc 取消排队
   *@author luofei
   *@date 2018-09-27 10:18:59
   *@param userId  用户唯一标识
   *@param csId    坐席ID
   *@return
   */
  cancel(userId,csId) {
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].userId == userId) {
          items.splice(i, 1);
        break;
      }
    }
  }
}

module.exports = queueService;