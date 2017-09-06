const util = require('../../../../util/util.js')
const config = require('../../../../config.js')
const app = getApp()
const ablumId = 2784;//2017=>
const prepage = 7;//2017=>
var WxParse = require('../../../wxParse/wxParse.js')

Page({
  data: {
      currentVideo : {},
      currentVideoUrl : '',
      viewCounts:0,
      userInfo: {},
	    hasUserInfo: false,
	    isShared: false,
      pid:0,
	    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onShow: function (options) {
    console.log('Page onShow')
  },
  onReady: function (options) {
    console.log('Page onReady')
  },
	onLoad: function (options) {
    console.log('page onLoad')
		var that = this
		var pid = 0;//play_id 0-1-2-3-4-5
		// var today = util.getFormatDate();//20170818
		if('id' in options ){
			pid = options.id;
		}
    that.setData({
        pid : pid
    })
		// 1.check local data. if newest! no update else update.
    var now = new Date(Date.now()-pid*86400000);
    // var start = new Date(now.getFullYear(), 0, 0);
    // var diff = now - start;
    // var oneDay = 1000 * 60 * 60 * 24;
    // var dayOfYear = Math.floor(diff / oneDay);
    // console.log('Day of year: ' + dayOfYear);

    var play_day = util.getFormatDate("full",'',now);//20170905
		{
			var url = config.getGraceListUrl +'/'+ play_day;
      wx.showNavigationBarLoading()
		  wx.request({
	      url: url,
	      success: function(res) {
					//回调地狱？？？
          // that.setData({
          //     viewCounts : res.data
          // })
          setCurrentVideo(res.data)
          setViewCounts(res.data[0].id)
          wx.hideNavigationBarLoading()
	      }
        //TODO faild 对不起，出错了，请刷新页面重试！
	    })
		}

		//init last video
		// var value = wx.getStorageSync('playlist_grace365')
    function setViewCounts(id){
      // var url = config.restGraceViewCount +'/'+ id+'/GET';
      // console.log(url)
      // wx.request({
      //   url: url,
      //   success: function(res) {
      //     //回调地狱？？？
      //     that.setData({
      //         viewCounts : res.data.counts
      //     })
      //   }
      // })
      // //set count ++

      var url = config.restGraceViewCount +'/'+ id;
      wx.request({
        url: url,
        success: function(res) {
          that.setData({
              viewCounts : res.data.counts
          })
        }
      })
    }

	  function setCurrentVideo(allVideos){
	  	var currentVideo = allVideos[0]
			that.setData({
	        currentVideo : currentVideo
	    })
      setCurrentVideoUrl(currentVideo['video_id']);
      if(currentVideo.content===''){
	       // setCurrentVideoContent(currentVideo.video_date);
         WxParse.wxParse('article', 'html', '<p>暂无内容，请小蜜蜂们搜集链接发送给小永微助手</p>'+'<p>永不止息，感恩有你</p>', that,5);
	    }else{
          WxParse.wxParse('article', 'html', currentVideo.content+currentVideo.excerpt, that,5);
      }
  	}

	  function setCurrentVideoUrl(video_id){
      wx.showNavigationBarLoading()
			// https://www.fuyin.tv/html/2784/47133.html
			// https://m.fuyin.tv/movie/player/movid/2784/urlid/45053.html
			// var url = 'https://www.fuyin.tv/html/'+that.data.currentVideo.ablumId+'/'+that.data.currentVideo.video_id+'.html';
			var url = 'https://wxapi.bce2.yongbuzhixi.com/api/fuyin/get365videourl/2784/'+video_id;
			wx.request({
	      url: url,
	      success: function(res) {
					var str = res.data;
          var currentVideoUrl=str.url+'?k='+str.k+'&e='+str.e
          that.setData({
              currentVideoUrl : currentVideoUrl
          })
          wx.hideNavigationBarLoading()
				}
			})
			//end of set video url!
	  }

    //get & set openid
    util.getOpenID(function(openid){
      // var app = getApp()
      app.globalData.openid = openid
      //get & set WP uid
      try {
        var uid = wx.getStorageSync('uid')
        if (uid) {
            app.globalData.uid = uid
        }else {
          wx.request({
            url: 'https://wxapi.bce2.yongbuzhixi.com/api/wp/getuid/'+openid, //仅为示例，并非真实的接口地址
            success: function(res) {
              uid = res.data.id;
              app.globalData.uid = uid
              wx.setStorage({
                key:"uid",
                data:uid
              })
            }
          })
        }

      } catch (e) {
        console.log(e)
      }
      //edn
    })
	  //get & set user info begin
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      try {
        var userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            that.setData({
              userInfo: userInfo,
              hasUserInfo: true
            })
        }else if(this.data.canIUse){
          console.log('canIUse',this.data.canIUse);
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          app.userInfoReadyCallback = res => {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        } else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        }
      } catch (e) {
        // Do something when catch error
        console.log('error',e)
      }
    }
    //create a wp user if no with openID!!!

    //user info end!

  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    wx.setStorage({
      key:"userInfo",
      data:e.detail.userInfo
    })
  },
  playNext: function(event){
  	this.videoContext.pause();
    var next = (Number(event.target.dataset.current) +1)
    if(next<5){
    	wx.navigateTo({
    		url: 'grace365?id='+ next.toString()
    	})
    }else{console.log(next);
      if(next>=prepage){
          wx.showModal({
            title: '提示',
            content: '您只能查看最近7天内容，珍惜当下，别再错过哦！',
            success: function(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
      }else{
        wx.redirectTo({
          url: 'grace365?id='+ next.toString()
        })
      }
    }
  },
  videoErrorCallback: function(e) {
    console.log('视频错误信息:',e.detail.errMsg)
  },
  tapLogin: function(event){
  	console.log(event)
  },
  tapShare: function(event){
  	wx.showShareMenu({
		  withShareTicket: true
		})
  },
  onShareAppMessage: function (res) {
		var that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '恩典365-'+that.data.currentVideo.video_date,
      path: '/page/ybzx/pages/grace365/grace365?id='+ that.data.pid,
      success: function(res) {
        console.log('分享成功！');
        that.setData({
            isShared: true
        })
      },
      fail: function(res) {
        console.log('转发失败')
      }
    }
  },
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  // 检测授权状态
	checkSettingStatu: function(cb) {
    var that = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
          var authSetting = res.authSetting;
          if (util.isEmptyObject(authSetting)) {
              console.log('首次授权');
          } else {
              console.log('不是第一次授权', authSetting);
              // 没有授权的提醒
              if (authSetting['scope.userInfo'] === false) {
                  wx.showModal({
                      title: '用户未授权',
                      content: '如需正常使用阅读记录功能，请按确定并在授权管理中选中“用户信息”，然后点按确定。最后再重新进入小程序即可正常使用。',
                      showCancel: false,
                      success: function (res) {
                          if (res.confirm) {
                              console.log('用户点击确定')
                              wx.openSetting({
                                  success: function success(res) {
                                      console.log('openSetting success', res.authSetting);
                                  }
                              });
                          }
                      }
                  })
              }
          }
      }
    });
	},
	onShow: function(){
    this.checkSettingStatu();
  }



})
