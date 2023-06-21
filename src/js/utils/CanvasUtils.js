(function () {
  var ns = $.namespace('pskl.utils');

  ns.CanvasUtils = {
    createCanvas : function (width, height, classList) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);

      if (typeof classList == 'string') {
        classList = [classList];
      }
      if (Array.isArray(classList)) {
        for (var i = 0 ; i < classList.length ; i++) {
          canvas.classList.add(classList[i]);
        }
      }

      return canvas;
    },

    createFromImageData : function (imageData) {
      var canvas = pskl.utils.CanvasUtils.createCanvas(imageData.width, imageData.height);
      var context = canvas.getContext('2d');
      context.putImageData(imageData, 0, 0);
      return canvas;
    },

    createFromImage : function (image) {
      var canvas = pskl.utils.CanvasUtils.createCanvas(image.width, image.height);
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return canvas;
    },

    /**
     * Splits the specified image into several new canvas elements based on the
     * supplied offset and frame sizes
     * @param image The source image that will be split
     * @param {Number} offsetX The padding from the left side of the source image
     * @param {Number} offsetY The padding from the top side of the source image
     * @param {Number} width The width of an individual frame
     * @param {Number} height The height of an individual frame
     * @param {Boolean} useHorizonalStrips True if the frames should be layed out from left to
     * right, False if it should use top to bottom
     * @param {Boolean} ignoreEmptyFrames True to ignore empty frames, except if
     * there are only empty frames -> then keep one, false to keep them.
     * @param {number} frameCount Number of frames in the spritesheet to show (based on frame size parameters above).
     *   If undefined, create as many frames as possible.
     * @returns {Array} An array of canvas elements that contain the split frames
     */
    createFramesFromImage : function (image, offsetX, offsetY, width, height,
        useHorizonalStrips, ignoreEmptyFrames, frameCount) {
      var canvasArray = [];
      var x = offsetX;
      var y = offsetY;
      var blankData = pskl.utils.CanvasUtils.createCanvas(width, height).toDataURL();
      var framesCreated = 0;
      // If frame count is undefined, create as many frames as possible.
      if (frameCount === undefined) {
        frameCount = Number.MAX_VALUE;
      }

      while (x + width <= image.width && y + height <= image.height && framesCreated < frameCount) {
        // Create a new canvas element
        var canvas = pskl.utils.CanvasUtils.createCanvas(width, height);
        var context = canvas.getContext('2d');

        // Blit the correct part of the source image into the new canvas
        context.drawImage(
          image,
          x,
          y,
          width,
          height,
          0,
          0,
          width,
          height);


        // If last time through loop and canvasArray is empty, we're loading a blank
        // animation and want to push a blank frame to the canvas array
        const lastFrame = (x + (2 * width) > image.width) && (y + (2 * height) > image.height);
        const canvasArrayIsEmpty = canvasArray.length === 0;
        const lastChanceToPushFrame = lastFrame && canvasArrayIsEmpty;

        // If we are including empty frame, the canvas is not blank, or it's the last chance
        // to push any frame, push the frame.
        if (!ignoreEmptyFrames || canvas.toDataURL() !== blankData || lastChanceToPushFrame) {
          canvasArray.push(canvas);
        }

        if (useHorizonalStrips) {
          // Move from left to right
          x += width;
          if (x + width > image.width) {
            x = offsetX;
            y += height;
          }
        } else {
          // Move from top to bottom
          y += height;
          if (y + height > image.height) {
            x += width;
            y = offsetY;
          }
        }
        framesCreated++;
      }

      return canvasArray;
    },

    /**
     * By default, all scaling operations on a Canvas 2D Context are performed using antialiasing.
     * Resizing a 32x32 image to 320x320 will lead to a blurry output.
     * On Chrome, FF and IE>=11, this can be disabled by setting a property on the Canvas 2D Context.
     * In this case the browser will use a nearest-neighbor scaling.
     * @param  {Canvas} canvas
     */
    disableImageSmoothing : function (canvas) {
      pskl.utils.CanvasUtils.setImageSmoothing(canvas, false);
    },

    enableImageSmoothing : function (canvas) {
      pskl.utils.CanvasUtils.setImageSmoothing(canvas, true);
    },

    setImageSmoothing : function (canvas, smoothing) {
      var context = canvas.getContext('2d');
      context.imageSmoothingEnabled = smoothing;
      context.mozImageSmoothingEnabled = smoothing;
      context.oImageSmoothingEnabled = smoothing;
      context.webkitImageSmoothingEnabled = smoothing;
      context.msImageSmoothingEnabled = smoothing;
    },

    clear : function (canvas) {
      if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    clone : function (canvas) {
      var clone = pskl.utils.CanvasUtils.createCanvas(canvas.width, canvas.height);

      //apply the old canvas to the new one
      clone.getContext('2d').drawImage(canvas, 0, 0);

      //return the new canvas
      return clone;
    },

    getImageDataFromCanvas : function (canvas) {
      var sourceContext = canvas.getContext('2d');
      return sourceContext.getImageData(0, 0, canvas.width, canvas.height).data;
    },

    getBase64FromCanvas : function (canvas, format) {
      format = format || 'png';
      var data = canvas.toDataURL('image/' + format);
      return data.substr(data.indexOf(',') + 1);
    }
  };
})();
