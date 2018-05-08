(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.todoEvents = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * 创建公共变量,包括自定义事件,document对象和db对象
   */
  var doc = document;
  var itemAdd = new CustomEvent('itemAdd', {
    detail: { data: {} }
  });
  var itemDelete = new CustomEvent('itemDelete', {
    detail: { data: {} }
  });
  var onSyncRecieve = new CustomEvent('onSyncRecieve', {
    detail: { data: {} }
  });
  var itemChange = new CustomEvent('itemChange', {
    detail: { data: {} }
  });
  var itemUpdate = new CustomEvent('itemUpdate', {
    detail: { data: {}, rows: [] }
  });
  var startSync = new CustomEvent('startSync');
  var db = new PouchDB('todos');
  exports.doc = doc;
  exports.itemAdd = itemAdd;
  exports.itemDelete = itemDelete;
  exports.onSyncRecieve = onSyncRecieve;
  exports.itemChange = itemChange;
  exports.itemUpdate = itemUpdate;
  exports.startSync = startSync;
  exports.db = db;
});