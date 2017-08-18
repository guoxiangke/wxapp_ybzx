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

module.exports = {
  getFormatDate: getFormatDate,

  formatTime: formatTime,
  formatLocation: formatLocation
}
