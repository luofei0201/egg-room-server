const immgr = require('./im_mgr')
const md5 = require('md5')
const request = require('request')

/**
 * 获取当前的时间戳 单位秒
 * ex: ts = 1509679482, 代表时间 2017-11-3 11:24:42
 */
function getTimeStamp() {
  var date = new Date()
  return parseInt(date.getTime() / 1000)
}

var RoomMgr = function (name) {
  /**
   * 房间名
   */
  this.name = name

  /**
   * 房间列表
   */
  this.rooms = {}

}

/**
 * 房间是否存在
 */
RoomMgr.prototype.isRoomExist = function (roomID) {
  return !!this.rooms[roomID]
}

/**
 * 是否是房间创建者
 */
RoomMgr.prototype.isRoomCreator = function (roomID, userID) {
  if (this.rooms[roomID] && this.rooms[roomID].roomCreator == userID) {
    return true
  }
  return false
}

/**
 * 创建房间
 */
RoomMgr.prototype.createRoom = function (roomId, roomName) {
  var room = {
    roomID: roomId,
    roomName: roomName,
    actived: false,
    pushers: {}
  }
  this.rooms[roomID] = room
}

/**
 * 进入房间
 */
RoomMgr.prototype.enterRoom = function (roomId, userId, userName) {
  var room = {
    roomId: roomId,
    roomName: roomName,
    actived: false,
    pushers: {}
  }
  room.pushers[userId] = {
    userId: userId,
    userName: userName,
    timestamp: getTimeStamp()
  }
  this.rooms[roomId] = room
}


/**
 * 删除(销毁)房间
 */
RoomMgr.prototype.delRoom = function (roomID) {
  delete this.rooms[roomID]
}


/**
 * 删除推流者 - 退房
 */
RoomMgr.prototype.delPusher = function (roomID, userID) {
  var creatorCanDestroyRoom = true;
  if (this.name == 'double_room') {
    //creatorCanDestroyRoom = config.double_room.creatorCanDestroyRoom;
  } else if (this.name == 'multi_room') {
    //creatorCanDestroyRoom = config.multi_room.creatorCanDestroyRoom;
  }
  if (this.isRoomCreator(roomID, userID) && creatorCanDestroyRoom) {
    this.delRoom(roomID)
    // notify
    immgr.destroyGroup(roomID)
  } else {
    if (this.isPusher(roomID, userID)) {
      var room = this.getRoom(roomID)
      if (room) {
        delete room.pushers[userID]
        if (!creatorCanDestroyRoom) {
          //房间没有人推流时，删除该房间
          if (room.pushers && Object.getOwnPropertyNames(room.pushers).length <= 0) {
            this.delRoom(roomID)
            immgr.destroyGroup(roomID)
            return;
          }
        }
        // notify
        immgr.notifyPushersChange(roomID)
      }
    }
  }
}

/**
 * 心跳超时检查
 * timeout 过期时间，单位秒
 */
RoomMgr.prototype.onTimerCheckHeartBeat = function (timeout) {
  /**
   * 遍历房间每个成员，检查pusher的时间戳是否超过timeout
   */
  var nowTS = getTimeStamp()
  for (var i in this.rooms) {
    if (this.rooms[i].actived == true) {
      for (var j in this.rooms[i].pushers) {
        if (this.rooms[i].pushers[j].timestamp + timeout < nowTS) {
          // 心跳超时
          var roomID = this.rooms[i].roomId
          var userID = this.rooms[i].pushers[j].userId
          //var streamID = this.rooms[i].pushers[j].streamID
        }
      }
    }
  }
  var endTS = getTimeStamp()
  console.log('check heartbeat use time:' + (endTS - nowTS) + 's of ' + this.name)
}

/**
 * 获取房间
 */
RoomMgr.prototype.getRoom = function (roomID) {
  return this.rooms[roomID]
}

/**
 * 获取房间列表
 */
RoomMgr.prototype.getRoomList = function (index, count) {
  var roomlist = []
  var cursor = 0
  var roomcnt = 0
  for (var i in this.rooms) {
    if (this.rooms[i].actived == true) {
      if (cursor >= index) {
        var room = {
          roomID: this.rooms[i].roomID,
          roomInfo: this.rooms[i].roomInfo,
          roomCreator: this.rooms[i].roomCreator,
          mixedPlayURL: this.rooms[i].mixedPlayURL,
          custom: this.rooms[i].custom
        }
        var pushers = []
        for (var j in this.rooms[i].pushers) {
          var pusher = {
            userID: this.rooms[i].pushers[j].userID,
            userName: this.rooms[i].pushers[j].userName,
            userAvatar: this.rooms[i].pushers[j].userAvatar,
            pushURL: this.rooms[i].pushers[j].pushURL,
            accelerateURL: this.rooms[i].pushers[j].accelerateURL
          }
          pushers.push(pusher)
        }
        room.pushers = pushers

        roomlist.push(room)
        roomcnt++
        if (roomcnt < count) {
          continue
        } else {
          break
        }
      } else {
        cursor++
        continue
      }
    }
  }
  return roomlist
}

/**
 * 心跳更新
 */
RoomMgr.prototype.setHeartBeat = function (roomID, userID) {
  var room = this.rooms[roomID]
  if (room) {
    var pusher = room.pushers[userID]
    if (pusher) {
      pusher.timestamp = getTimeStamp()
    }
  }
}

module.exports = RoomMgr
