var c = {
  audio: false,
  video: {
    width: 480,
    height: 360
  }
};
var threshController = document.querySelector('input');
var inputValueDisplayElement = document.querySelector('label.input-value');
var motionDeltaDisplayElement = document.querySelector('label.motion-delta');
var video = document.createElement('video'), canvas = document.querySelector('canvas'), context = canvas.getContext('2d');
canvas.width = c.video.width;
canvas.height = c.video.height;
navigator.mediaDevices.getUserMedia(c).then(handleStream).catch(function (err) {
  console.log(err);
});
var previousFrame = false;
var motion = false;
function renderFrame(timestamp) {
  inputValueDisplayElement.innerHTML = threshController.value;
  context.drawImage(video, 0, 0, c.video.width, c.video.height);
  var imageData = context.getImageData(0, 0, c.video.width, c.video.height).data;
  var delta = motionDelta(imageData, previousFrame);
  previousFrame = imageData;
  //if delta is 0, we're sampling frames faster than the camera is producing them
  if (delta !== 0) {
    motionDeltaDisplayElement.innerHTML = delta;
    motionDeltaDisplayElement.style.backgroundColor = delta > threshController.value ? 'green' : 'red';
  }
  requestAnimationFrame(renderFrame);
}
function motionDelta(imageData, previousFrame) {
  var delta = 0;
  if (previousFrame) {
    for (var i = 0; i < imageData.length; i++) {
      delta += Math.abs(imageData[i] - previousFrame[i]);
    }
  }
  return delta;
}
function handleStream(stream) {
  console.log(stream);
  video.srcObject = stream;
  video.onloadedmetadata = function (e) {
    video.play();
    renderFrame();
  };
}