var c = {
  audio: false,
  video: {
    width: 480,
    height: 360
  }
};
var threshController = document.querySelector('input');
var video = document.createElement('video'), canvas = document.querySelector('canvas'), context = canvas.getContext('2d');
canvas.width = c.video.width;
canvas.height = c.video.height;
navigator.mediaDevices.getUserMedia(c).then(handleStream).catch(function (err) {
  console.log(err);
});
function renderFrame() {
  context.drawImage(video, 0, 0, c.video.width, c.video.height);
  var imageData = context.getImageData(0, 0, c.video.width, c.video.height).data;
  context.putImageData(new ImageData(luminosity(imageData), c.video.width, c.video.height), 0, 0);
  requestAnimationFrame(renderFrame);
}
function luminosity(imageData) {
  for (var i = 0; i < imageData.length; i = i + 4) {
    var luminosity = 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
    if (luminosity < threshController.value) {
      imageData[i] = 0;
      imageData[i + 1] = 0;
      imageData[i + 2] = 0;
    } else {
      imageData[i] = 255;
      imageData[i + 1] = 255;
      imageData[i + 2] = 255;
    }
  }
  return imageData;
}
function handleStream(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function (e) {
    video.play();
    renderFrame();
  };
}