// reference http://www.nxp.com/files/sensors/doc/app_note/AN3397.pdf

let sampleX;
let sampleY;
let sampleZ;
let accelerationData = [];
let countX, countY;
let accelerationX = [];
let accelerationY = [];
let velocityX = 0, velocityY = 0;
let direction;
let sstateX = 0, sstateY = 0;


/*
 The purpose of the calibration routine is to obtain the value of the reference threshold.
 It consists on a 1024 samples average in no-movement condition.
*/

var calibrationsCount = 0;

export function calibrate(data, callback) {  
  
  var samples = 1024
  var needsCalibration = calibrationsCount < 1024

  if(!needsCalibration) {
    sstateX /= 1024
    sstateY /= 1024  
    console.log('+ End calibration: ', sstateX, sstateY)
    callback()
    return
  }

  sstateX += data.x
  sstateY += data.y
  
  calibrationsCount+=1

}

export function getPosition() {

}