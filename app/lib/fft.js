function getAudioContext() {
  return (window.AudioContext||window.webkitAudioContext)
}

export default function fft(id) {

  var audio = document.getElementById('track')
  var audioContext = new AudioContext()
  var source = audioContext.createMediaElementSource(audio)
  var analyser = audioContext.createAnalyser()

  source.connect(analyser);
  analyser.connect(audioContext.destination)

  analyser.fftSize = 2048


  var bufferLength = analyser.frequencyBinCount
  var dataArray = new Uint8Array(analyser.frequencyBinCount)


  // frequencyBinCount tells you how many values you'll receive from the analyser
  var frequencyData = new Uint8Array(analyser.frequencyBinCount)

  return { audio, analyser }
}