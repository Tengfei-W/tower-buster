System.register([], function (_export, _context) {
  "use strict";
  var cc, Application;
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  function updateProgress(progress) {
    window.top.postMessage({
      type: 'loading',
      gameCode: '8WGtd7TLH',
      progress: progress,
    }, '*');
  }
  return {
    setters: [],
    execute: function () {
      _export("Application", Application = /*#__PURE__*/function () {
        function Application() {
          _classCallCheck(this, Application);
          this.settingsPath = 'src/settings.json';
          this.effectSettingsPath = 'src/effect.bin';
          updateProgress(10);
          this.showFPS = false;
        }
        _createClass(Application, [{
          key: "init",
          value: function init(engine) {
            cc = engine;
            cc.game.onPostBaseInitDelegate.add(this.onPostInitBase.bind(this));
            cc.game.onPostSubsystemInitDelegate.add(this.onPostSystemInit.bind(this));
            updateProgress(20);
          }
        }, {
          key: "onPostInitBase",
          value: function onPostInitBase() {// cc.settings.overrideSettings('assets', 'server', '');
            // do custom logic
            updateProgress(30);
          }
        }, {
          key: "onPostSystemInit",
          value: function onPostSystemInit() {// do custom logic
            updateProgress(40);
          }
        }, {
          key: "start",
          value: function start() {
            return cc.game.init({
              debugMode: false ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
              settingsPath: this.settingsPath,
              effectSettingsPath: this.effectSettingsPath,
              overrideSettings: {
                // assets: {
                //      preloadBundles: [{ bundle: 'main', version: 'xxx' }],
                // }
                profiling: {
                  showFPS: this.showFPS
                }
              }
            }).then(function () {
              updateProgress(50);
              return cc.game.run();
            });
          }
        }]);
        return Application;
      }());
    }
  };
});