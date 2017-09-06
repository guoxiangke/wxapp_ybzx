const openIdUrl = require('./config').openIdUrl
const util = require('./util/util.js')

App({
  globalData: {
    userInfo: null,
    hasLogin: false,
    openid: null
  },
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  // lazy loading openid
  getUserOpenId: function(callback) {
    var self = this

    if (self.globalData.openid) {
      callback(null, self.globalData.openid)
    } else {
      wx.login({
        success: function(data) {
          wx.request({
            url: openIdUrl,
            data: {
              code: data.code
            },
            success: function(res) {
              console.log('拉取openid成功', res)
              self.globalData.openid = res.data.openid
              callback(null, self.globalData.openid)
            },
            fail: function(res) {
              console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
              callback(res)
            }
          })
        },
        fail: function(err) {
          console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
          callback(err)
        }
      })
    }
  },
  getOpenID: function(){
    wx.login({
      success: function(res) {
        if (res.code) {
          //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
          wx.request({
            url: 'https://wxapi.d.yongbuzhixi.com/api/openid/'+res.code, //仅为示例，并非真实的接口地址
            success: function(res) {
              var app = getApp()
              app.globalData.openid = res.data.openid
              console.log(app.globalData)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
})
