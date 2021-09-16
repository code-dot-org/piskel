/* globals casper, setPiskelFromGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test updating default size works', 14 , function(test) {
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

    testSetDefaultSize();
  }

  function testSetDefaultSize() {
    test.assertExists('[name="default-width"]', 'Check if width input is available');
    test.assertExists('[name="default-height"]', 'Check if height input is available');

    test.assertEquals(getValue('[name="default-width"]'), "256", 'Default width is 256px');
    test.assertEquals(getValue('[name="default-height"]'), "256", 'Default height is 256px');

    // Update width/height
    casper.sendKeys('[name="default-width"]', "1");
    casper.sendKeys('[name="default-height"]', "2");
    test.assertEquals(getValue('[name="default-width"]'), "2561", 'Default width is 2561px');
    test.assertEquals(getValue('[name="default-height"]'), "2562", 'Default height is 2562px');

    casper.click('#default-size-form .resize-button');
    // Changing the piskel default size should close the panel automatically
    casper.waitForSelector('[data-pskl-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    test.assertEquals(evalLine('pskl.UserSettings.get("DEFAULT_SIZE").width'),
      2561, 'Piskel width is now 2561 pixels');

    test.assertEquals(evalLine('pskl.UserSettings.get("DEFAULT_SIZE").height'),
      2562, 'Piskel height is now 2562 pixels');
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
