var c = {
  video: {
    width: 480,
    height: 360
  }
};
var nyan = document.querySelector('img');
function SensorGrid(config) {
  'use strict';
  var sensorGrid = this;
  var sensoryOutput;
  var scale = config && 'sensorScale' in config ? config.sensorScale : 0.05;
  var video = config && 'video' in config ? config.video : document.createElement('video');
  video.classList.add('sensor-grid-video');
  video.setAttribute('autoplay', true);
  var cvs = config && 'canvas' in config ? config.canvas : document.createElement('canvas');
  cvs.classList.add('sensor-grid-canvas');
  var mirrorX = config && 'mirrorX' in config ? config.mirrorX : true;
  var ctx = cvs.getContext('2d');
  var process = function (pixel, index, collection) {
  };
  var showSensorData = config && 'showSensorData' in config ? config.showSensorData : false;
  sensorGrid.setSensorDataVisiblity = function (doShow) {
    showSensorData = doShow;
  };
  sensorGrid.prepareSensoryData = function (func) {
    process = func;
  };
  sensorGrid.getCanvas = function () {
    return cvs;
  };
  sensorGrid.getContext = function () {
    return ctx;
  };
  sensorGrid.getSensorPixels = function () {
    return sensoryOutput;
  };
  function describeSize(width, height) {
    cvs.width = Math.floor(width * scale);
    cvs.setAttribute('width', Math.floor(width * scale));
    cvs.setAttribute('height', Math.floor(height * scale));
    cvs.style.width = Math.floor(width * scale) + 'px';
    cvs.style.height = Math.floor(height * scale) + 'px';
    cvs.height = Math.floor(height * scale);
  }
  navigator.mediaDevices.getUserMedia(c).then(handleStream).catch(function (err) {
    console.log(err);
  });
  function handleStream(stream) {
    console.log(stream);
    video.srcObject = stream;
    video.onloadedmetadata = function (e) {
      video.play();
      describeSize(c.video.width, c.video.height);
      renderFrame();
    };
  }
  function renderFrame() {
    ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
    sensoryOutput = { pixels: [] };
    var rawSensorPixels = SensorGrid.util.chunk(ctx.getImageData(0, 0, cvs.width, cvs.height).data, 4);
    var rawSensorRows = SensorGrid.util.chunk(rawSensorPixels, cvs.width, true);
    SensorGrid.util.each(rawSensorRows, function (row, y, rawSensorRows) {
      var y = y;
      var innerEach = mirrorX ? SensorGrid.util.eachRight : SensorGrid.util.each;
      innerEach(row, function (pixel, nX, row) {
        var x = mirrorX ? cvs.width - 1 - nX : nX;
        var flag = process(pixel, sensoryOutput.pixels.length, sensoryOutput);
        var pxl;
        if (flag) {
          pxl = {
            x: x,
            y: y,
            a: flag
          };
        } else {
          pxl = {
            x: x,
            y: y,
            a: false
          };
        }
        sensoryOutput.pixels.push(pxl);
      });
    });
    if (showSensorData) {
      ctx.fillStyle = 'rgba(0,255,0,.5)';
      for (var i = 0; i < sensoryOutput.pixels.length; i++) {
        if (sensoryOutput.pixels[i].a) {
          ctx.fillRect(sensoryOutput.pixels[i].x, sensoryOutput.pixels[i].y, 1, 1);
        }
      }
    }
    requestAnimationFrame(renderFrame);
  }
}
SensorGrid.util = {
  inRange: function (subject, low, high) {
    return subject >= low && subject <= high;
  },
  chunk: function (parentArrayRaw, childLength, destroyParent) {
    var parentArray;
    if (destroyParent) {
      parentArray = parentArrayRaw;
    } else {
      parentArray = SensorGrid.util.cloneSimpleArray(parentArrayRaw);
    }
    var chunkedArray = [];
    while (parentArray.length >= childLength) {
      var childArray = [];
      for (var i = 0; i < childLength; i++) {
        childArray.push(parentArray.shift());
      }
      chunkedArray.push(childArray);
    }
    if (parentArray.length > 0) {
      chunkedArray.push(parentArray);
    }
    return chunkedArray;
  },
  cloneSimpleArray: function (arr) {
    var returner = [];
    for (var i = 0; i < arr.length; i++) {
      returner[i] = arr[i];
    }
    return returner;
  },
  each: function (arr, func) {
    for (var i = 0; i < arr.length; i++) {
      func(arr[i], i, arr);
    }
  },
  eachRight: function (arr, func) {
    for (var i = arr.length - 1; i >= 0; i--) {
      func(arr[i], i, arr);
    }
  },
  RGBApixel: function (pixelArray) {
    return {
      r: pixelArray[0],
      g: pixelArray[1],
      b: pixelArray[2],
      a: pixelArray[3]
    };
  }
};
//if lodash exists, us its native funcs
if (window._) {
  SensorGrid.util.inRange = _.inRange;
  SensorGrid.util.each = _.each;
  SensorGrid.util.eachRight = _.eachRight;
  SensorGrid.util.chunk = _.chunk;
}
SensorGrid.filters = {
  rgbRange: function (redRange, greenRange, blueRange) {
    return function (pixel, index, collection) {
      var pxl = SensorGrid.util.RGBApixel(pixel);
      return SensorGrid.util.inRange(pxl.r, redRange[0], redRange[1]) && SensorGrid.util.inRange(pxl.g, greenRange[0], greenRange[1]) && SensorGrid.util.inRange(pxl.b, blueRange[0], blueRange[1]);
    };
  },
  rgbNear: function (red, green, blue, nearness) {
    return function (pixel, index, collection) {
      var pxl = SensorGrid.util.RGBApixel(pixel);
      return SensorGrid.util.inRange(pxl.r, red - nearness, red + nearness) && SensorGrid.util.inRange(pxl.g, green - nearness, green + nearness) && SensorGrid.util.inRange(pxl.b, blue - nearness, blue + nearness);
    };
  },
  channelNear: function (channel, value, nearness) {
    if (typeof channel == 'string') {
      channel = channel.toUpperCase();
    }
    if (channel === 'RED' || channel === 'R' || channel === 0) {
      channel = 'r';
    }
    if (channel === 'GREEN' || channel === 'G' || channel === 1) {
      channel = 'g';
    }
    if (channel === 'BLUE' || channel === 'B' || channel === 2) {
      channel = 'b';
    }
    return function (pixel, index, collection) {
      var pxl = SensorGrid.util.RGBApixel(pixel);
      return SensorGrid.util.inRange(pxl[channel], value - nearness, value + nearness);
    };
  },
  luminosity: function (lumens, lowerThan) {
    return function (pixel, index, collection) {
      var pxl = SensorGrid.util.RGBApixel(pixel);
      var luminosity = 0.2126 * pxl.r + 0.7152 * pxl.g + 0.0722 * pxl.b;
      if (!('lowLuminosity' in collection)) {
        collection.lowLuminosity = luminosity;
      } else {
        collection.lowLuminosity = Math.min(luminosity, collection.highLuminosity);
      }
      if (!('highLuminosity' in collection)) {
        collection.highLuminosity = luminosity;
      } else {
        collection.highLuminosity = Math.max(luminosity, collection.highLuminosity);
      }
      if (lowerThan) {
        return luminosity > lumens;
      } else {
        return luminosity < lumens;
      }
    };
  }
};
//{sensorScale:0.2}
//{sensorScale:0.2}
var sensorGrid = new SensorGrid({
  video: document.querySelector('video'),
  sensorScale: 1,
  showSensorData: true,
  mirrorX: true
});
sensorGrid.prepareSensoryData(SensorGrid.filters.rgbRange([
  0,
  100
], [
  100,
  255
], [
  0,
  100
]));
//sensorGrid.prepareSensoryData(SensorGrid.filters.rgbNear(200,200,200,55))
//sensorGrid.prepareSensoryData(SensorGrid.filters.channelNear('green', 200, 56));
//sensorGrid.prepareSensoryData(SensorGrid.filters.luminosity(30));
//document.body.appendChild(sensorGrid.getCanvas());
function getPx() {
  var canvas = sensorGrid.getCanvas();
  var pix = sensorGrid.getSensorPixels().pixels;
  var pixels = _.filter(pix, function (p) {
    return p.a;
  });
  var x = _.sumBy(pixels, function (p) {
    return p.x;
  }) / pixels.length;
  var y = _.sumBy(pixels, function (p) {
    return p.y;
  }) / pixels.length;
  console.log(pixels.length);
  if (pixels.length > 1000) {
    nyan.style.left = x * 2 + 'px';
    nyan.style.top = y * 2 + 'px';
  } else {
    nyan.style.left = '-1000px';
    nyan.style.top = '-1000px';
  }
  requestAnimationFrame(getPx);
}
document.addEventListener('keypress', function (e) {
  getPx();
});