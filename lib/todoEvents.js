(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
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
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var TodoEvent = function () {
    function TodoEvent() {
      _classCallCheck(this, TodoEvent);

      this.handlers = {};
      this.rows = [];
    }

    _createClass(TodoEvent, [{
      key: "subscribe",
      value: function subscribe(type, listener) {
        if (!(type in this.handlers)) {
          this.handlers[type] = [];
        }
        this.handlers[type].push(listener);
      }
    }, {
      key: "off",
      value: function off(type, listener) {
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
      }
    }, {
      key: "publish",
      value: function publish(type) {
        var list = this.handlers[type],
            length = this.handlers[type].length;
        var i = void 0;

        for (var _len = arguments.length, thisArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          thisArgs[_key - 1] = arguments[_key];
        }

        for (i = length - 1; i >= 0; i -= 1) {
          list[i].apply(this, thisArgs);
        }
      }
    }, {
      key: "getTodoRows",
      value: function getTodoRows() {
        return this.rows;
      }
    }, {
      key: "setTodoRows",
      value: function setTodoRows(rows) {
        this.rows = rows;
      }
    }]);

    return TodoEvent;
  }();

  exports.default = new TodoEvent();
});