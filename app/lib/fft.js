function getAudioContext() {
  return (window.AudioContext||window.webkitAudioContext)
}

export default function fft(id) {

  var audio = document.getElementById('track')
  var AudioCtx = getAudioContext()
  var audioCtx = new AudioCtx()
  var source = audioCtx.createMediaElementSource(audio)

  //set up the different audio nodes we will use for the app
  var analyser = audioCtx.createAnalyser();
  var distortion = audioCtx.createWaveShaper();
  var gainNode = audioCtx.createGain();
  var biquadFilter = audioCtx.createBiquadFilter();
  var convolver = audioCtx.createConvolver();

  // connect the nodes together
  source.connect(analyser);
  analyser.connect(distortion);
  distortion.connect(biquadFilter);
  biquadFilter.connect(convolver);
  //convolver.connect(gainNode);
  //gainNode.connect(audioCtx.destination)

  biquadFilter.connect(audioCtx.destination);
  //analyser.connect(audioCtx.destination)
  biquadFilter.type = "lowshelf";

  biquadFilter.frequency.value = 0;
  biquadFilter.gain.value = 0;


  // Create a gain node
  // var gainNode = audioCtx.createGain();
  // var analyser = audioCtx.createAnalyser()
  
  // var filter = audioCtx.createBiquadFilter();
  // filter.type = filter.LOWPASS;
  // filter.frequency.value = 5000;
  
  // filter.frequency.value = 1;
  // filter.Q.value = 10

  // source.connect(analyser);
  // analyser.connect(filter)
  // filter.connect(gainNode);
  // gainNode.connect(audioCtx.destination);
  

  analyser.smoothingTimeConstant = 0.97;
  analyser.fftSize = 2048


  //var bufferLength = analyser.frequencyBinCount
  //var dataArray = new Uint8Array(analyser.frequencyBinCount)

  // frequencyBinCount tells you how many values you'll receive from the analyser
  //var frequencyData = new Uint8Array(analyser.frequencyBinCount)

  return { audio, analyser, source, biquadFilter }
}