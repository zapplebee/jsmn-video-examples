var c = {
  audio: false,
  video: {
    width: 1000,
    height: 1000
  }
};
var video = document.createElement('video'), canvas = document.querySelector('canvas'), context = canvas.getContext('2d');
canvas.width = c.video.width;
canvas.height = c.video.height;
function renderFrame(timestamp) {
  context.drawImage(video, 0, 0, c.video.width, c.video.height);
  var imageData = context.getImageData(0, 0, c.video.width, c.video.height).data;
  context.putImageData(new ImageData(removeGreen(imageData), c.video.width, c.video.height), 0, 0);
  requestAnimationFrame(renderFrame);
}
function removeGreen(imageData) {
  for (var i = 0; i < imageData.length; i = i + 4) {
    var luminosity = 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
    if (imageData[i + 1] > 140 && luminosity < 180) {
      imageData[i + 3] = 0;
    }
  }
  return imageData;
}
video.loop = true;
video.muted = true;
video.src = 'doit.mp4';
video.onloadedmetadata = function (e) {
  video.play();
  renderFrame();
};