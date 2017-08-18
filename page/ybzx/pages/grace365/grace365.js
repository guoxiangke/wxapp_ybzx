const util = require('../../../../util/util.js')
const app = getApp()
Page({
  data: {
      currentVideo : {},
      currentVideoContents:{},
      currentVideoUrl : '',

      userInfo: {},
	    hasUserInfo: false,
	    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

	onLoad: function (options) {
		var that = this
		var playid = 'last';
		var today = util.getFormatDate();//20170818
		if('id' in options ){
			playid = options.id;
			console.log(playid,'options:playid')
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
			var url = 'https://m.fuyin.tv/movie/detail/movid/2784.html';
		  wx.request({
	      url: url,
	      success: function(res) {
					var str = res.data;
					str = str.substr(str.indexOf('am-padding-top-xs')+1,str.lastIndexOf('am-padding-top-xs')+500);
					var count =0; 
					var pos;
					var title;
					var time;
					var href;
					var ids
					var items =[];
					while(str.indexOf('am-padding-top-xs') !== -1){
						pos = str.indexOf('am-padding-top-xs')
						str = str.substr(pos+1);
						var find = str.substr(0,str.indexOf('观看'))
						
						href  = find.match(/href="([^"]+)/)[1]
						var day = find.match(/am-text-truncate">(\S+)/)[1]
						
						var title = find.match(/天 ([^<]+)/)[1]
						
						time = title.match(/\d+/)[0]
						title = title.replace(time,'').replace('恩典365','')
						ids= href.match(/\d+/g)
						items[count++] = {title:title,date:time,ablumId:ids[0],videoId:ids[1]}
					}
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

		//init contents form https://api.yongbuzhixi.com/api/wxapp/grace365
	  wx.request({
      url: 'https://api.yongbuzhixi.com/api/wxapp/grace365',
      success: function(res) {
				var currentVideoContents = {};
				currentVideoContents.section1 = '暂无内容'
				currentVideoContents.section2 = '来做小🐝吧\r\n每日从公众号里复制图文链接发给永不止息公众号即可。'
				res.data.forEach(function(el){
					if(el.title.indexOf(that.data.currentVideo.date) !== -1){
							var str = el.body;
							if(str.indexOf('<section powered-by="xiumi.us"') !== -1){
									var pos = str.indexOf('<section powered-by="xiumi.us"')
									var str = str.substr(pos+'<section powered-by="xiumi.us">'.length);
									pos = str.indexOf('<section powered-by="xiumi.us"')
									str = str.substr(pos+'<section powered-by="xiumi.us">'.length);
									var nextpos = str.indexOf('<section powered-by="xiumi.us"');
									currentVideoContents.section1 = str.substr(0,nextpos).replace(/<(?:.|\n)*?>/gm, '')
									currentVideoContents.section2 = str.substr(nextpos).replace(/<(?:.|\n)*?>/gm, '') 

									that.setData({
							        currentVideoContents : currentVideoContents
							    })
							}else{
								console.log('解析htmlof xiumi form api error！')
							}

					}
				})
				if(currentVideoContents.section1 == '暂无内容'){
					that.setData({
			        currentVideoContents : currentVideoContents
			    })
				}

				
			}
		})
		//end of get contents for api.ybzx

	  function setCurrentVideo(allVideos,currentVideoIndex){
	  	var currentVideo = allVideos[currentVideoIndex]
	  	currentVideo['currentVideoIndex'] = currentVideoIndex
			that.setData({
	        currentVideo : currentVideo
	    })
	    setCurrentVideoUrl(currentVideo['ablumId'],currentVideo['videoId']);
  	}
	  function setCurrentVideoUrl(ablumId,videoId){
			// https://www.fuyin.tv/html/2784/47133.html
			// https://m.fuyin.tv/movie/player/movid/2784/urlid/45053.html
			// var url = 'https://www.fuyin.tv/html/'+that.data.currentVideo.ablumId+'/'+that.data.currentVideo.videoId+'.html'; 
			var url = 'https://m.fuyin.tv/movie/player/movid/'+ablumId+'/urlid/'+videoId+'.html'; 
			wx.request({
	      url: url,
	      success: function(res) {
					var str = res.data;
					var pos1 = str.indexOf('var video=[');
					var pos2 = str.indexOf('start_player()');
					str = str.substr(pos1, pos2-pos1);

					str  = str.match(/video=\[\'(\S+)/)[1].replace("']",'')
					// http://db.http.fuyin.tv:8016/html5/
	      	var currentVideoUrl = str.replace('http://db.m.fuyin.tv:8015/mdb/','https://downs.fuyin.tv/pcdown/')
	      	// console.log(currentVideoUrl)
	      	// return currentVideoUrl
		      that.setData({
			        currentVideoUrl : currentVideoUrl
			    })
				}
			})
			//end of set video url!
	  }


	  //user info begin
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
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
  	wx.navigateTo({
  		url: 'grace365?id='+ (event.target.dataset.current-1).toString()
  	})
  },
  tapLogin: function(event){
  	console.log(event)
  },
  tapShare: function(event){
  	console.log(event)
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
      title: '恩典365'+that.data.currentVideo.title,
      path: 'grace365?id='+ that.data.currentVideo.currentVideoIndex,
      success: function(res) {
        console.log('grace365?id='+ that.data.currentVideo.currentVideoIndex);
      },
      fail: function(res) {
        console.log('转发失败','grace365?id='+ that.data.currentVideo.currentVideoIndex)// 
      }
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }



})