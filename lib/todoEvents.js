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
  var doc = exports.doc = document;
  var db = exports.db = new PouchDB('todos');
  function TodoEvent() {
    this.handlers = {};
    this.rows = [];
  }
  TodoEvent.prototype.subscribe = function (type, listener) {
    if (!(type in this.handlers)) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(listener);
  };
  TodoEvent.prototype.off = function (type, listener) {
    var i = void 0,
        position = -1;
    var list = this.handlers[type],
        length = this.handlers[type].length;
    for (i = length - 1; i >= 0; i -= 1) {
      if (list[i] === listener) {
        position = i;
        break;
      }
    }
    if (position === -1) {
      return;
    }
    if (length === 1) {
      delete this.handlers[type];
    } else {
      this.handlers[type].splice(position, 1);
    }
  };
  TodoEvent.prototype.publish = function (type) {
    for (var _len = arguments.length, thisArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      thisArgs[_key - 1] = arguments[_key];
    }

    console.log(thisArgs);
    var list = this.handlers[type],
        length = this.handlers[type].length;
    var i = void 0;
    for (i = length - 1; i >= 0; i -= 1) {
      list[i].apply(this, thisArgs);
    }
  };
  TodoEvent.prototype.getTodoRows = function () {
    return this.rows;
  };
  TodoEvent.prototype.setTodoRows = function (rows) {
    this.rows = rows;
  };
  var todoEvent = exports.todoEvent = new TodoEvent();
});