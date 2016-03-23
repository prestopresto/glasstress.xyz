var FusionPositionSensorVRDevice = require('./fusion-position-sensor-vr-device.js')
var positionSensor = new FusionPositionSensorVRDevice()


socket.emit('device', 'Device connected')

// motion support
if(window.DeviceMotionEvent) {
  socket.emit('device', 'DeviceMotionEvent is supported')
}

// geolocation support
if("geolocation" in navigator) {
  socket.emit('device', 'Geolocation is supported') 

  document.getElementById('geo').innerHTML = 'Geolocation supported'

  var watchID = navigator.geolocation.watchPosition(function(position) {
    document.getElementById('geo').innerHTML = 'Position updated'
    socket.emit('geo', 
      JSON.stringify({
        x: position.coords.latitude, 
        y: position.coords.altitude,
        z: position.coords.longitude,
        heading: position.coords.heading
      })
    )
  });
}


function update() {
  var position = positionSensor.getState()
  
  if(position) {
     socket.emit('acceleration', JSON.stringify(position))
  }
  
 
  requestAnimationFrame(update)
}

update()

