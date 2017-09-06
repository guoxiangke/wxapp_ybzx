function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}
// 20170818 
function getFormatDate(format="full",split='', MyDate=new Date()){
  var month = ('0' + (MyDate.getMonth()+1)).slice(-2);
  var day = ('0' + MyDate.getDate()).slice(-2)
  var year = (format=='full')?MyDate.getFullYear():MyDate.getYear().toString().substr(1)
  return [year,month,day].join(split);
}
// 是否为空对象
function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}

//__LINE__ https://stackoverflow.com/questions/11386492/accessing-line-number-in-v8-javascript-chrome-node-js
Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

//create or get exsits uid of WP
function getWpUid(openid,callback){
  // /api/wp/getuid/:openid
}

function getOpenID(callback){
  var app = getApp()
  if(app.globalData.openid) {callback(app.globalData.openid); return;}
  //else
  wx.login({
    success: function(res) {
      if (res.code) {
        //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
        wx.request({
          url: 'https://wxapi.bce2.yongbuzhixi.com/api/openid/'+res.code, //仅为示例，并非真实的接口地址
          success: function(res) {
            callback(res.data.openid)
          }
        })
      } else {
        console.log('getOpenID失败！' + res.errMsg)
      }
    }
  });
}

module.exports = {
  getFormatDate: getFormatDate,
  isEmptyObject:isEmptyObject,
  formatTime: formatTime,
  formatLocation: formatLocation,
  getOpenID:getOpenID
}
