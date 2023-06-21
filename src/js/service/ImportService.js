/* @file Image and Animation import service supporting the import dialog. */
(function () {
  var ns = $.namespace('pskl.service');
  /**
   * Image an animation import service supporting the import dialog.
   * @param {!PiskelController} piskelController
   * @constructor
   */
  ns.ImportService = function (piskelController) {
    this.piskelController_ = piskelController;
  };

  ns.ImportService.prototype.init = function () {
    $.subscribe(Events.PISKEL_FILE_IMPORT_FAILED, this.onPiskelFileImportFailed_);
  };

  /**
   * Called when a piskel load failed event is published. Display an appropriate error message.
   * TODO: for some failure reasons, we might want to display a dialog with more details.
   */
  ns.ImportService.prototype.onPiskelFileImportFailed_ = function (evt, reason) {
    $.publish(Events.SHOW_NOTIFICATION, [{
      'content': 'Piskel file import failed (' + reason + ')',
      'hideDelay' : 10000
    }]);
  };

  /**
   * Given an image object and some options, create a new Piskel and open it
   * for editing.
   * @param {Image} image
   * @param {Object} options
   *        - {String}  importType 'single' if not spritesheet
   *        - {String}  name
   *        - {Boolean} smoothing
   *        - {Number}  frameSizeX
   *        - {Number}  frameSizeY
   *        - {Number}  frameOffsetX (only used in spritesheet imports)
   *        - {Number}  frameOffsetY (only used in spritesheet imports)
   *        - {Number}  frameRate - (in frames per second)
   *        - {Number}  frameCount - maximum number of frames to display, or undefined to display all frames.
   * @param {Function} onComplete
   *        Callback called when the new piskel has been created, with the new piskel
   *        as single argument.
   */
  ns.ImportService.prototype.newPiskelFromImage = function (image, options, onComplete) {
    var setPiskelFromFrameImages = function (frameImages) {
      var piskel = this.createPiskelFromImages_(frameImages, options.name, options.frameSizeX,
          options.frameSizeY, options.smoothing, options.frameCount);
      this.piskelController_.setPiskel(piskel);
    }.bind(this);

    this.importFromImages(image, options, setPiskelFromFrameImages, onComplete);
  };

  /**
   * Given an image object and some options, merge the frames with the currently open
   * Piskel and open it for editing.
   * @param {!Image} image
   * @param {!Object} options
   * @param {!string} options.importType - 'single' if not spritesheet
   * @param {!number} options.frameSizeX
   * @param {!number} options.frameSizeY
   * @param {number} [options.frameOffsetX] only used in spritesheet imports.
   * @param {number} [options.frameOffsetY] only used in spritesheet imports.
   * @param {!boolean} options.smoothing
   * @param {number} [options.frameRate] in frames per second
   * @param {number} [options.frameCount] maximum number of frames to display, or undefined to display all frames.
   * @param {function} [onComplete]
   */
  ns.ImportService.prototype.importFramesFromImage = function (image, options, onComplete) {
    var setPiskelFromFrameImages = function (frameImages) {
      var piskel = this.createPiskelFromImages_(frameImages, options.name, options.frameSizeX,
          options.frameSizeY, options.smoothing);
      var mergedPiskel = this.mergePiskels(this.piskelController_.getPiskel(), piskel);
      this.piskelController_.setPiskel(mergedPiskel);
    }.bind(this);

    this.importFromImages(image, options, setPiskelFromFrameImages, onComplete);
  };

  ns.ImportService.prototype.importFromImages = function(image, options, setPiskelFromFrameImages, onComplete) {
    onComplete = onComplete || Constants.EMPTY_FUNCTION;
    var importType = options.importType;
    var name = options.name;
    var smoothing = options.smoothing;
    var frameSizeX = options.frameSizeX;
    var frameSizeY = options.frameSizeY;
    var frameOffsetX = options.frameOffsetX;
    var frameOffsetY = options.frameOffsetY;
    var smoothing = options.smoothing;
    var frameRate = typeof options.frameRate !== 'undefined' ?
        options.frameRate : Constants.DEFAULT.FPS;
    var frameCount = options.frameCount;

    var gifLoader = new window.SuperGif({
      gif: image
    });

    gifLoader.load({
      success: function () {
        var images = gifLoader.getFrames().map(function (frame) {
          return pskl.utils.CanvasUtils.createFromImageData(frame.data);
        });

        var piskel;
        if (importType === 'single' || images.length > 1) {
          // Single image import or animated gif
          setPiskelFromFrameImages(images);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(images[0], frameSizeX,
            frameSizeY, frameOffsetX, frameOffsetY, frameCount);
          setPiskelFromFrameImages(frameImages);
        }
        onComplete(piskel);
      }.bind(this),
      error: function () {
        var piskel;
        if (importType === 'single') {
          // Single image
          setPiskelFromFrameImages([image]);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(image, frameSizeX, frameSizeY,
            frameOffsetX, frameOffsetY, frameCount);
          setPiskelFromFrameImages(frameImages);
        }
        onComplete();
      }.bind(this)
    });
  };

  /**
   * @param {!Image} image
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!number} frameOffsetX
   * @param {!number} frameOffsetY
   * @param {!number} [frameCount]
   * @returns {canvas[]}
   * @private
   */
  ns.ImportService.prototype.createImagesFromSheet_ = function (image,
      frameSizeX, frameSizeY, frameOffsetX, frameOffsetY, frameCount) {
    return pskl.utils.CanvasUtils.createFramesFromImage(
        image,
        frameOffsetX,
        frameOffsetY,
        frameSizeX,
        frameSizeY,
        /*useHorizonalStrips=*/ true,
        // Don't ignore empty frames, as we will still animate them in the gif.
        // Hiding them leads to confusing behavior.
        /*ignoreEmptyFrames=*/ false,
        frameCount);
  };

  /**
   * @param {canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @return {pskl.model.Piskel}
   * @private
   */
  ns.ImportService.prototype.createPiskelFromImages_ = function (images, name,
      frameSizeX, frameSizeY, smoothing) {
    var name = name || 'Imported piskel';
    var frames = this.createFramesFromImages_(images, frameSizeX, frameSizeY, smoothing);
    var layer = pskl.model.Layer.fromFrames('Layer 1', frames);
    var descriptor = new pskl.model.piskel.Descriptor(name, '');
    return pskl.model.Piskel.fromLayers([layer], Constants.DEFAULT.FPS, descriptor);
  };

  /**
   * @param {!canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @returns {pskl.model.Frame[]}
   * @private
   */
  ns.ImportService.prototype.createFramesFromImages_ = function (images, frameSizeX, frameSizeY, smoothing) {
    return images.map(function (image) {
      var resizedImage = pskl.utils.ImageResizer.resize(image, frameSizeX, frameSizeY, smoothing);
      return pskl.utils.FrameUtils.createFromImage(resizedImage);
    });
  };

  /**
   * Adds frames from an additionalPiskel to an originalPiskel, adjusting the size of
   * both piskels to the largest dimensions of either piskel, and centering the content.
   * This will only work when there is only one layer.
   * Multi layer animations are disabled from the UI in code-dot-org/piskel
   * @param {!pskl.model.Piskel} originalPiskel
   * @param {!pskl.model.Piskel} additionalPiskel
   * @returns {pskl.model.Piskel}
   */
  ns.ImportService.prototype.mergePiskels = function(originalPiskel, additionalPiskel) {
    if (originalPiskel.layers.length != 1 || originalPiskel.layers.length != 1) {
      throw new Error(
        'mergePiskels was provided with piskel parameters with more than one layer');
    }

    var maxWidth = Math.max(originalPiskel.width, additionalPiskel.width);
    var maxHeight = Math.max(originalPiskel.height, additionalPiskel.height);

    this.resizePiskel(additionalPiskel, maxWidth, maxHeight);
    this.resizePiskel(originalPiskel, maxWidth, maxHeight);

    for (var i = 0; i < additionalPiskel.layers[0].size(); i++) {
      originalPiskel.layers[0].addFrame(additionalPiskel.layers[0].getFrameAt(i));
    }
    return originalPiskel;
  };

  /**
   * @param {!pskl.model.Piskel} piskel
   * @param {!number} width
   * @param {!number} height
   */
  ns.ImportService.prototype.resizePiskel = function(piskel, width, height) {
    if (piskel.width < width || piskel.height < height) {
      var numFrames = piskel.layers[0].size();
      for (var j = 0; j < numFrames; j++) {
        var resizedFrame = this.setFrameSize(piskel.layers[0].getFrameAt(j), width, height);
        piskel.layers[0].replaceFrameAt(resizedFrame, j);
      }
      piskel.width = width;
      piskel.height = height;
    }
  };

  /**
   * Modified from ResizeController
   * @param {!pskl.model.Frame} frame
   * @param {!number} width
   * @param {!number} height
   * @returns {pskl.model.Frame}
   */
  ns.ImportService.prototype.setFrameSize = function (frame, width, height) {
    var resizedFrame = new pskl.model.Frame(width, height);
    var xOffset = Math.round((width - frame.width) / 2);
    var yOffset = Math.round((height - frame.height) / 2);
    frame.forEachPixel(function (color, x, y) {
      resizedFrame.setPixel(x + xOffset, y + yOffset, color);
    });
    return resizedFrame;
  };
})();
