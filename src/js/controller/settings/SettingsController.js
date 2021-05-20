(function () {
  var ns = $.namespace('pskl.controller.settings');

  var settings = {
    'user' : {
      template : 'templates/settings/preferences.html',
      controller : ns.PreferencesController
    },
    'resize' : {
      template : 'templates/settings/resize.html',
      controller : ns.resize.ResizeController
    },
    'export' : {
      template : 'templates/settings/export.html',
      controller : ns.exportimage.ExportController
    },
    'import' : {
      template : 'templates/settings/import.html',
      controller : ns.ImportController
    },
    'localstorage' : {
      template : 'templates/settings/localstorage.html',
      controller : ns.LocalStorageController
    },
    'save' : {
      template : 'templates/settings/save.html',
      controller : ns.SaveController
    }
  };
  var SEL_SETTING_CLS = 'has-expanded-drawer';
  var EXP_DRAWER_CLS = 'expanded';

  ns.SettingsController = function (piskelController, i18n) {
    this.createSettingsDom_(i18n);
    this.i18n = i18n;
    this.piskelController = piskelController;
    this.closeDrawerShortcut = pskl.service.keyboard.Shortcuts.MISC.CLOSE_POPUP;
    this.settingsContainer = document.querySelector('[data-pskl-controller=settings]');
    this.drawerContainer = document.getElementById('drawer-container');
    this.isExpanded = false;
    this.currentSetting = null;
  };

  /**
   * @public
   */
  ns.SettingsController.prototype.init = function () {
    pskl.utils.Event.addEventListener(this.settingsContainer, 'click', this.onSettingsContainerClick_, this);
    pskl.utils.Event.addEventListener(document.body, 'click', this.onBodyClick_, this);

    $.subscribe(Events.CLOSE_SETTINGS_DRAWER, this.closeDrawer_.bind(this));
  };

  ns.SettingsController.prototype.onSettingsContainerClick_ = function (evt) {
    var setting = pskl.utils.Dom.getData(evt.target, 'setting');
    if (!setting) {
      return;
    }

    if (this.currentSetting != setting) {
      this.loadSetting_(setting);
    } else {
      this.closeDrawer_();
    }

    evt.stopPropagation();
    evt.preventDefault();
  };

  ns.SettingsController.prototype.onBodyClick_ = function (evt) {
    var target = evt.target;

    var isInDrawerContainer = pskl.utils.Dom.isParent(target, this.drawerContainer);
    var isInSettingsIcon = target.dataset.setting;
    var isInSettingsContainer = isInDrawerContainer || isInSettingsIcon;

    if (this.isExpanded && !isInSettingsContainer) {
      this.closeDrawer_();
    }
  };

  ns.SettingsController.prototype.loadSetting_ = function (setting) {
    this.drawerContainer.innerHTML = pskl.utils.Template.get(settings[setting].template);

    // when switching settings controller, destroy previously loaded controller
    this.destroyCurrentController_();

    this.currentSetting = setting;
    this.currentController = new settings[setting].controller(this.piskelController, this.i18n);
    this.currentController.init();

    pskl.app.shortcutService.registerShortcut(this.closeDrawerShortcut, this.closeDrawer_.bind(this));

    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    var selectedSettingButton = document.querySelector('[data-setting=' + setting + ']');
    if (selectedSettingButton) {
      selectedSettingButton.classList.add(SEL_SETTING_CLS);
    }
    this.settingsContainer.classList.add(EXP_DRAWER_CLS);

    this.isExpanded = true;
  };

  ns.SettingsController.prototype.closeDrawer_ = function () {
    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    this.settingsContainer.classList.remove(EXP_DRAWER_CLS);

    this.isExpanded = false;
    this.currentSetting = null;
    document.activeElement.blur();

    this.destroyCurrentController_();
  };

  ns.SettingsController.prototype.destroyCurrentController_ = function () {
    if (this.currentController) {
      pskl.app.shortcutService.unregisterShortcut(this.closeDrawerShortcut);
      if (this.currentController.destroy) {
        this.currentController.destroy();
        this.currentController = null;
      }
    }
  };

  ns.SettingsController.prototype.createPreferencesSetting = function (i18n) {
    var templateValues = {
      dataSetting: 'user',
      iconSetting: 'icon-settings-gear-white',
      title: "<span class='highlight'>" + i18n.preferencesSetting() + "</span></br>"
    };
    var templateId = 'settings-options-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.SettingsController.prototype.createResizeSetting = function (i18n) {
    var templateValues = {
      dataSetting: 'resize',
      iconSetting: 'icon-settings-resize-white',
      title: "<span class='highlight'>" + i18n.resizeSetting() + "</span></br>" + i18n.resizeSettingDescriptorResizeTheDrawingArea()
    };
    var templateId = 'settings-options-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.SettingsController.prototype.createSaveSetting = function (i18n) {
    var templateValues = {
      dataSetting: 'save',
      iconSetting: 'icon-settings-save-white',
      title: "<span class='highlight'>" + i18n.saveSetting() + "</span></br>" + i18n.saveSettingDescriptorSaveToGallerySaveLocally() + "</br>" + i18n.saveSettingDescriptorExportAsFile()
    };
    var templateId = 'settings-options-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.SettingsController.prototype.createExportSetting = function (i18n) {
    var templateValues = {
      dataSetting: 'export',
      iconSetting: 'icon-settings-export-white',
      title: "<span class='highlight'>" + i18n.exportSetting() + "</span></br>" + i18n.exportSettingDescriptorExportAsImageSpriteSheet() + "</br>" + i18n.exportSettingDescriptorOrAsAnimatedGif()
    };
    var templateId = 'settings-options-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.SettingsController.prototype.createImportSetting = function (i18n) {
    var templateValues = {
      dataSetting: 'import',
      iconSetting: 'icon-settings-open-folder-white',
      title: "<span class='highlight'>" + i18n.importSetting() + "</span></br>" + i18n.importSettingDescriptorImportAsExistingImage() + "</br>" + i18n.importSettingDescriptorAnimatedGifOrPiskelFile()
    };
    var templateId = 'settings-options-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

   /**
   * @private
   */
  ns.SettingsController.prototype.createSettingsDom_ = function (i18n) {
    var html = '';
    html += this.createPreferencesSetting(i18n);
    html += this.createResizeSetting(i18n);
    html += this.createSaveSetting(i18n);
    html += this.createExportSetting(i18n);
    html += this.createImportSetting(i18n);
    $('#settings-vertical-centerer').html(html);
  };
})();
