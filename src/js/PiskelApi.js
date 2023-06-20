var PiskelApi = (function (module) {

  /**
   * External API that a parent application can use to communicate with an
   * embedded copy of Piskel editor.  Once initialized with a reference to the
   * iframe hosting Piskel, this class can handle all communication between the
   * two applications.
   *
   * A current limitation (for security reasons) is that the embedded copy of
   * Piskel must have the same origin as the parent application.
   *
   * @example
   *   var PiskelApi = require('piskel');
   *   var piskelApi = new PiskelApi();
   *   piskelApi.attachToPiskel(document.querySelector('iframe'));
   *   piskelApi.loadSpritesheet(myImage, 256, 128);
   * @constructor
   */
  function PiskelApi() {
    /** @private {iframe} */
    this.iframe_ = null;

    /** @private {Object.<string, function[]>} */
    this.callbacks_ = {};

    /** @private {function} Bound so we can subscribe/unsubscribe it later. */
    this.boundReceiveMessage_ = this.receiveMessage_.bind(this);
  }

  /**
   * Connect to Piskel in an iframe and start listening for messages from it.
   * @param {iframe} iframe hosting an embedded Piskel editor
   * @constructor
   */
  PiskelApi.prototype.attachToPiskel = function (iframe) {
    this.iframe_ = iframe;
    window.addEventListener('message', this.boundReceiveMessage_);
  };

  /**
   * Stop listening for messages and remove our reference to the Piskel frame.
   */
  PiskelApi.prototype.detachFromPiskel = function () {
    window.removeEventListener('message', this.boundReceiveMessage_);
    this.iframe_ = null;
  };

  /** @enum {string} Message type constants for Piskel internal use. */
  PiskelApi.MessageType = {
    // Piskel is initialized and ready for API commmands.
    // Arguments: none
    PISKEL_API_READY: 'PISKEL_API_READY',

    // Create a new animation and ready it for editing
    // Arguments: frameSizeX, frameSizeY, frameRate
    NEW_PISKEL: 'NEW_PISKEL',

    // Load a spritesheet for editing
    // Arguments: uri, frameSizeX, frameSizeY, frameRate
    LOAD_SPRITESHEET: 'LOAD_SPRITESHEET',

    // Requested spritesheet load has completed
    // Arguments: none
    ANIMATION_LOADED: 'ANIMATION_LOADED',

    // The animation changed, and Piskel has internally saved its state.
    // Arguments: ???
    STATE_SAVED: 'STATE_SAVED',

    // Hide or show the frame column.
    // Arguments: hideFrameColumn
    TOGGLE_FRAME_COLUMN: 'TOGGLE_FRAME_COLUMN',

    // User selected add new frame
    // Arguments: none
    ADD_NEW_FRAME_CLICKED: 'ADD_NEW_FRAME_CLICKED',

    // Add a set of new frames to the current piskel
    // Arguments: uri, frameSizeX, frameSizeY
    APPEND_FRAMES: 'APPEND_FRAMES',

    // Requested spritesheet merge and load has completed
    // Arguments: none
    FRAMES_LOADED: 'FRAMES_LOADED',

    // Use a restricted set of tools [Spritelab/Gamelab]
    USE_RESTRICTED: 'USE_RESTRICTED',

    // Add a blank frame to the current piskel
    ADD_BLANK_FRAME: 'ADD_BLANK_FRAME',
  };

  /**
   * Tell Piskel to create a new, single-frame, single-layer animation with the
   * given dimensions and framerate, and open it for editing.
   * @param {number} frameSizeX - Width of new animation, in pixels.
   * @param {number} frameSizeY - Height of new animation, in pixels.
   * @param {number} [frameRate] - Animation rate in frames per second.
   * @param {function} [onComplete] - Called when new animation is ready for editing.
   */
  PiskelApi.prototype.createNewPiskel = function (frameSizeX, frameSizeY, frameRate, onComplete) {
    onComplete = typeof onComplete === 'function' ? onComplete : Constants.EMPTY_FUNCTION;
    this.callBackOnce_(PiskelApi.MessageType.ANIMATION_LOADED, onComplete);
    this.sendMessage_({
      type: PiskelApi.MessageType.NEW_PISKEL,
      frameSizeX: frameSizeX,
      frameSizeY: frameSizeY,
      frameRate: frameRate
    });
  };

  /**
   * Tell Piskel to load a spritesheet for editing, replacing whatever document
   * is currently open in the editor.  Assumes that frames in the spritesheet
   * will have a uniform size, and be arranged in a grid read left-to-right,
   * then top-to-bottom.
   * @param {!string} uri - An image url, or a data URI corresponding to a
   *        spritesheet image that Piskel can load.
   * @param {number} frameSizeX - Width of a frame within the spritesheet, in
   *        pixels.
   * @param {number} frameSizeY - Height of a frame within the spritesheet, in
   *        pixels.
   * @param {number} [frameRate] - Animation rate in frames per second.
   * @param {function} [onComplete] - Called when the spritesheet is loaded.
   * @param {number} [frameCount] - Maximum number of frames to display. If undefined,
  *          show all possible frames.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs
   */
  PiskelApi.prototype.loadSpritesheet = function (uri, frameSizeX, frameSizeY,
      frameRate, onComplete, frameCount) {
    onComplete = typeof onComplete === 'function' ? onComplete : Constants.EMPTY_FUNCTION;
    this.callBackOnce_(PiskelApi.MessageType.ANIMATION_LOADED, onComplete);

    // Send the load message to Piskel.
    this.sendMessage_({
      type: PiskelApi.MessageType.LOAD_SPRITESHEET,
      uri: uri,
      frameSizeX: frameSizeX,
      frameSizeY: frameSizeY,
      frameRate: frameRate,
      frameCount: frameCount
    });
  };

  /**
   * Tell Piskel to load an spritesheet for editing, appending to whatever document
   * is currently open in the editor.  Assumes that frames in the spritesheet
   * will have a uniform size, and be arranged in a grid read left-to-right,
   * then top-to-bottom. Will update the final size to be the max of the current or new spritesheet.
   * @param {!string} uri - An image url, or a data URI corresponding to a
   *        spritesheet image that Piskel can load.
   * @param {number} frameSizeX - Width of a frame within the spritesheet, in
   *        pixels.
   * @param {number} frameSizeY - Height of a frame within the spritesheet, in
   *        pixels.
   * @param {function} [onComplete] - Called when the spritesheet is loaded.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs
   */
  PiskelApi.prototype.appendFrames = function (uri, frameSizeX, frameSizeY, onComplete) {
    onComplete = typeof onComplete === 'function' ? onComplete : Constants.EMPTY_FUNCTION;
    this.callBackOnce_(PiskelApi.MessageType.FRAMES_LOADED, onComplete);

    // Send the load message to Piskel.
    this.sendMessage_({
      type: PiskelApi.MessageType.APPEND_FRAMES,
      uri: uri,
      frameSizeX: frameSizeX,
      frameSizeY: frameSizeY
    });
  };

  /**
   * Tell Piskel to add a blank frame to the current piskel.
   */
  PiskelApi.prototype.addBlankFrame = function () {
    this.sendMessage_({
      type: PiskelApi.MessageType.ADD_BLANK_FRAME
    });
  };

  /**
   * Tell Piskel to use a restricted set of tools.
   */
  PiskelApi.prototype.restrictTools = function () {
    this.sendMessage_({
      type: PiskelApi.MessageType.USE_RESTRICTED
    });
  };

  /**
   * Hides and shows the frame column in Piskel UI.
   * @param {boolean} hideFrameColumn
   */
  PiskelApi.prototype.toggleFrameColumn = function(hideFrameColumn) {
    this.sendMessage_({
      type: PiskelApi.MessageType.TOGGLE_FRAME_COLUMN,
      hideFrameColumn: hideFrameColumn
    });
  };

  /**
   * Register a callback that will be called when Piskel is initialized and ready
   * for API messages.
   * @param {function} callback
   */
  PiskelApi.prototype.onPiskelReady = function (callback) {
    this.addCallback_(PiskelApi.MessageType.PISKEL_API_READY, callback);
  };

  /**
   * Register a callback that will be called whenever Piskel issues a
   * save event.
   * @param {function} callback
   */
  PiskelApi.prototype.onStateSaved = function (callback) {
    this.addCallback_(PiskelApi.MessageType.STATE_SAVED, callback);
  };

  /**
   * Register a callback that will be called whenever a user clicks
   * add new frame.
   * @param {function} callback
   */
  PiskelApi.prototype.onAddFrame = function (callback) {
    this.addCallback_(PiskelApi.MessageType.ADD_NEW_FRAME_CLICKED, callback);
  };

  /**
   * Send a message to Piskel.
   * @param {!Object} message
   * @private
   */
  PiskelApi.prototype.sendMessage_ = function (message) {
    if (!this.iframe_) {
      throw new Error('Unable to communicate with Piskel; call attachToPiskel first.');
    }
    this.iframe_.contentWindow.postMessage(message, window.location.origin);
  };

  /**
   * Called when Piskel sends a message to the external application.
   * @param {Event} event
   * @private
   */
  PiskelApi.prototype.receiveMessage_ = function (event) {
    // Ignore messages not sent from the allowed origin
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== window.location.origin) {
      return;
    }

    var message = event.data;
    if (typeof message.type === 'undefined') {
      return;
    }

    this.getCallbacksForType_(message.type).forEach(function (callback) {
      callback.call(undefined, message); // TODO: Unpack message?
    });
  };

  /**
   * @param {string} type
   * @param {function} callback
   * @private
   */
  PiskelApi.prototype.addCallback_ = function (type, callback) {
    this.getCallbacksForType_(type).push(callback);
  };

  /**
   * Remove one registered instance of the exact given callback for the given
   * type.  Silent no-op if callback is not found.
   * @param {string} type
   * @param {function} callback
   * @private
   */
  PiskelApi.prototype.removeCallback_ = function (type, callback) {
    var callbacks = this.getCallbacksForType_(type);
    var index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }
  };

  /**
   * Add callback to be called once then removed.
   * @param {string} type
   * @param {function} callback
   * @private
   */
  PiskelApi.prototype.callBackOnce_ = function (type, onComplete) {
    var callback = function () {
      this.removeCallback_(type, callback);
      onComplete();
    }.bind(this);
    this.addCallback_(type, callback);
  };

  /**
   * @param {string} type
   * @returns {function[]}
   * @private
   */
  PiskelApi.prototype.getCallbacksForType_ = function (type) {
    if (typeof this.callbacks_[type] === 'undefined') {
      this.callbacks_[type] = [];
    }
    return this.callbacks_[type];
  };

  module.exports = PiskelApi;
  return PiskelApi;
})(typeof module !== 'undefined' ? module : {});
