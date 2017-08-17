Page({
  data: {
      currentVideo : {},
      currentVideoContents:{}
  },

	onLoad: function (options) {
		console.log(options)
		// 1.check local data. if newest! no update else update.
		var date = new Date()
		var year = date.getFullYear()-2000
		var month = date.getMonth() + 1
		var day = date.getDate()
		var today = year.toString() + 	month.toString() + day.toString()
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
			  wx.request({
		      url: 'https://www.fuyin.tv/content/view/movid/2784/',
		      success: function(res) {
						var str = res.data;
						str = str.substr(str.indexOf('movie-list-title')+1,str.lastIndexOf('movie-list-title')+500);
		      	console.log(res.errMsg)
						var count =0; 
						var pos;
						var title;
						var time;
						var href;
						var ids
						var items =[];
						while(str.indexOf('movie-list-title') !== -1){
							pos = str.indexOf('movie-list-title')
							str = str.substr(pos+1);
							find = str.substr(0,str.indexOf('</td>'))
							href  = find.match(/href="(\S+)/)[1]
							title = find.match(/title="(\S+)/)[1]
							time = title.match(/\d+/)[0]
							title = title.replace(time,'')
							ids= href.match(/\d+/g)
							items[count++] = {title:title,date:time,ablumId:ids[0],videoID:ids[1]}
						}
						wx.setStorageSync('playlist_grace365',items)
						wx.setStorage({
						  key:"playlist_grace365_updateTime",
						  data:today
						})	
						// console.log(items)

		      }
		    })
		}

		//init last video
		console.log('brefore save!')
		var that = this
		wx.getStorage({
		  key: 'playlist_grace365',
		  success: function(res) {
		      console.log(res.data[0])
		      that.setData({
			        // lylist_data_ori : ly_data,
			        currentVideo : res.data[0]
			    })
		  } 
		})
		//init contents form https://api.yongbuzhixi.com/api/wxapp/grace365

	  wx.request({
      url: 'https://api.yongbuzhixi.com/api/wxapp/grace365',
      success: function(res) {
				res.data.forEach(function(el){
					console.log(el.title);
					if(el.title.indexOf('20170731') !== -1){
							var str = el.body;
							var currentVideoContents = {};
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
								console.log('error')
							}
							console.log(currentVideoContents);

					}
				})

				
			}
		})


  }



})