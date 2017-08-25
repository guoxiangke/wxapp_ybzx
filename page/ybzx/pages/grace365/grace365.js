const util = require('../../../../util/util.js')
const app = getApp()
Page({
  data: {
      currentVideo : {},
      currentVideoContents:{},
      currentVideoUrl : '',

      userInfo: {},
	    hasUserInfo: false,
	    isShared: false,
	    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

	onLoad: function (options) {
		var that = this
		var playid = 'last';
		var today = util.getFormatDate();//20170818
		if('id' in options ){
			playid = options.id;
		}
		// 1.check local data. if newest! no update else update.

		var update = false;
		try {
		  var value = wx.getStorageSync('playlist_grace365_updateTime')
		  if (value) {
				if(value !=today) update = true
		  }else{
				update = true
		  }
		} catch (e) {
		  // Do something when catch error
			console.log('die!!!')
		}

		if(update){
			var url = 'https://wxapi.d.yongbuzhixi.com/api/fuyin/get365list';
		  wx.request({
	      url: url,
	      success: function(res) {
					var items = res.data;
					wx.setStorageSync('playlist_grace365',items)
					wx.setStorage({
					  key:"playlist_grace365_updateTime",
					  data:today
					})

					//回调地狱？？？

					var currentVideoIndex = (playid!='last'?playid:items.length-1);
					setCurrentVideo(items,currentVideoIndex)

	      }
	    })
		}

		//init last video
		// var value = wx.getStorageSync('playlist_grace365')

		wx.getStorage({
		  key: 'playlist_grace365',
		  fail: function(res){
		  	console.log(res,'wx.getStorage:playlist_grace365')
		  },
		  success: function(res) {
		  	var currentVideoIndex = (playid!='last'?playid:res.data.length-1);
		  	setCurrentVideo(res.data,currentVideoIndex)
		  }
		})
		function setCurrentVideoContent(videoDate,that){
			//init contents form https://api.yongbuzhixi.com/api/wxapp/grace365
			wx.showNavigationBarLoading()
			var url = 'https://wxapi.d.yongbuzhixi.com/api/fuyin/get365content/'+videoDate;
			console.log(url);
		  wx.request({
	      url: url,
	      success: function(res) {
					var currentVideoContents = res.data;
					console.log(currentVideoContents);
					that.setData({
			        currentVideoContents : currentVideoContents
			    })
				},
				complete : function(res){
					wx.hideNavigationBarLoading()
				}
			})
			//end of get contents for api.ybzx
		}

	  function setCurrentVideo(allVideos,currentVideoIndex){
	  	var currentVideo = allVideos[currentVideoIndex]
	  	currentVideo['currentVideoIndex'] = currentVideoIndex
			that.setData({
	        currentVideo : currentVideo
	    })
	    setCurrentVideoContent(currentVideo.date,that);
	    setCurrentVideoUrl(currentVideo['ablumId'],currentVideo['videoId']);
  	}

	  function setCurrentVideoUrl(ablumId,videoId){
			// https://www.fuyin.tv/html/2784/47133.html
			// https://m.fuyin.tv/movie/player/movid/2784/urlid/45053.html
			// var url = 'https://www.fuyin.tv/html/'+that.data.currentVideo.ablumId+'/'+that.data.currentVideo.videoId+'.html';
			var url = 'https://wxapi.d.yongbuzhixi.com/api/fuyin/get365videourl/'+ablumId+'/'+videoId;
			wx.request({
	      url: url,
	      success: function(res) {
					var str = res.data;

          that.setData({
              currentVideoUrl : str.url+'?k='+str.k+'&e='+str.e
          })
				}
			})
			//end of set video url!
	  }


	  //user info begin
	  console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
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
    //user info end!

  },
  playNext: function(event){
  	this.videoContext.pause();
  	wx.navigateTo({
  		url: 'grace365?id='+ (event.target.dataset.current-1).toString()
  	})
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
      console.log(res.target)
    }
    return {
      title: '恩典365-'+that.data.currentVideo.date,
      path: '/page/ybzx/pages/grace365/grace365?id='+ that.data.currentVideo.currentVideoIndex,
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
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
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
          console.log(res.authSetting);
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
