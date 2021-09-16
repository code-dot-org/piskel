/* globals casper, setPiskelFromGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test resize feature works', 16 , function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Piskel ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
    test.assertDoesntExist('.settings-section-resize', 'Check if resize settings drawer is closed');

    // Open resize panel.
    this.click('[data-setting="resize"]');
    this.waitForSelector('.settings-section-resize', onResizePanelReady, test.timeout, 10000);
  }

  function onResizePanelReady() {
    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-resize', 'Check if resize panel is opened');

    testResizePiskel();
  }

  function testResizePiskel() {
    test.assertExists('[name="resize-width"]', 'Check if width input is available');
    test.assertExists('[name="resize-height"]', 'Check if height input is available');

    test.assertEquals(getValue('[name="resize-width"]'), "256", 'Resize width is 256px');
    test.assertEquals(getValue('[name="resize-height"]'), "256", 'Resize height is 256px');

    // Check that the resize ratio checkbox is available and checked.
    test.assertExists('.resize-ratio-checkbox', 'Check if resize ratio checkbox is available');
    test.assert(casper.evaluate(function () {
      return document.querySelector('.resize-ratio-checkbox').checked;
    }), 'Keep ratio checkbox is checked');

    // Update width/height
    casper.sendKeys('[name="resize-width"]', "0");
    test.assertEquals(getValue('[name="resize-width"]'), "2560", 'Resize width is 2560px');
    test.assertEquals(getValue('[name="resize-height"]'), "2560", 'Resize height is 2560px');

    casper.click('#resize-canvas-form .resize-button');
    // Resizing the piskel should close the panel automatically
    casper.waitForSelector('[data-pskl-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    test.assertEquals(evalLine('pskl.app.piskelController.getPiskel().getWidth()'), 2560, 'Piskel width is now 2560 pixels');
    test.assertEquals(evalLine('pskl.app.piskelController.getPiskel().getHeight()'), 2560, 'Piskel height is now 2560 pixels');
  }

  casper
    .start(casper.cli.get('baseUrl')+"/?debug")
    .then(function () {
      this.echo("URL loaded");
      this.waitForSelector('#drawing-canvas-container canvas', onTestStart, test.timeout, 20000);
    })
    .run(function () {
      test.done();
    });
});
