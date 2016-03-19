function getAudioContext() {
  return (window.AudioContext||window.webkitAudioContext)
}

export default function fft(id) {

  var audio = document.getElementById('track')
  var audioContext = new AudioContext()
  var source = audioContext.createMediaElementSource(audio)
  var analyser = audioContext.createAnalyser()

  var filter = audioContext.createBiquadFilter();
  filter.type = filter.LOWPASS;
  filter.frequency.value = 5000;
  
  filter.frequency.value = 1;
  filter.Q.value = 10

  // Connect source to filter, filter to destination.
  source.connect(filter);
  filter.connect(audioContext.destination);

  source.connect(analyser);
  analyser.connect(audioContext.destination)
  analyser.smoothingTimeConstant = 0.95;
  analyser.fftSize = 2048


  //var bufferLength = analyser.frequencyBinCount
  //var dataArray = new Uint8Array(analyser.frequencyBinCount)

  // frequencyBinCount tells you how many values you'll receive from the analyser
  //var frequencyData = new Uint8Array(analyser.frequencyBinCount)

  return { audio, analyser, source }
}