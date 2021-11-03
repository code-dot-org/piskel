/**
 * This service stubs or overrides all methods on the Piskel FileDropperService
 * (src/js/service/FileDropperService.js) as code.org users are not allowed
 * to drag-and-drop files to upload them.
 *
 * This service is initialized in place of the original in src/js/app.js
 */

(function () {
  var ns = $.namespace('cdo.service');

  ns.FileDropperService = function () {};

  ns.FileDropperService.prototype.init = function () {
    document.body.addEventListener('drop', this.onFileDrop.bind(this), false);
    document.body.addEventListener('dragover', this.onFileDragOver.bind(this), false);
  };

  ns.FileDropperService.prototype.onFileDragOver = function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'none';
  };

  ns.FileDropperService.prototype.onFileDrop = function (event) {
    event.preventDefault();
    event.stopPropagation();
  };

  ns.FileDropperService.prototype.onPaletteLoaded_ = function () {};

  ns.FileDropperService.prototype.onPiskelFileLoaded_ = function () {};

  ns.FileDropperService.prototype.onPiskelFileError_ = function () {};

  ns.FileDropperService.prototype.onImageLoaded_ = function () {};
})();
