(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['./todoEvents'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('./todoEvents'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.todoEvents);
    global.todoControl = mod.exports;
  }
})(this, function (_todoEvents) {
  'use strict';

  var _todoEvents2 = _interopRequireDefault(_todoEvents);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var db = new PouchDB('todos'); /**
                                  * 用于数据相关的操作,包括
                                  * 1 与数据库的同步
                                  * 2 数据项的增加,删除和修改
                                  */

  var doc = document;

  _todoEvents2.default.subscribe('onSyncRecieve', sync);
  _todoEvents2.default.subscribe('itemDelete', onItemDelete);
  _todoEvents2.default.subscribe('itemChange', onItemDataChange);
  _todoEvents2.default.subscribe('itemAdd', onitemAdd);
  /**
   * 与数据库同步,获取初始数据保存到缓存中
   */
  function sync() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    db.allDocs({
      include_docs: true,
      descending: true
    }, function (err, docs) {
      var rowsSend = [];
      docs.rows.forEach(function (row) {
        var complete = data.complete,
            addDate = data.addDate,
            finishDate = data.finishDate;

        var dateBoolean = (!addDate || row.doc.date === addDate) && (!finishDate || row.doc.finishDate === finishDate);
        if (complete === 'all' && !addDate && !finishDate) {
          rowsSend.push(row.doc);
        } else if (complete === 'all' && dateBoolean) {
          rowsSend.push(row.doc);
        } else if (row.doc.complete === (complete === 'completed') && dateBoolean) {
          rowsSend.push(row.doc);
        }
      });
      _todoEvents2.default.setTodoRows(rowsSend);
      _todoEvents2.default.publish('itemUpdate');
    });
  }
  /**
   * 当数据项增加时调用
   */
  function onitemAdd(data) {
    db.put(data, function (err, res) {
      if (!err) {
        data._rev = res.rev;
        _todoEvents2.default.getTodoRows().unshift(data);
        _todoEvents2.default.publish('itemUpdate');
      } else {
        console.error('something error', err);
      }
    });
  }
  /**
   * 当数据项删除时调用
   */
  function onItemDelete(data) {
    var rows = _todoEvents2.default.getTodoRows();
    db.remove(data.id, data.rev).then(function () {
      rows.forEach(function (row) {
        if (row._id === data.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      _todoEvents2.default.publish('itemUpdate');
    });
  }
  /**
   * 当数据项改变时调用
   */
  function onItemDataChange(data) {
    db.put(data).then(function (docs) {
      _todoEvents2.default.getTodoRows().forEach(function (row) {
        if (row._id === data._id) {
          row.date = data.date;
          row.title = data.title;
          row.finishDate = data.finishDate;
          row._rev = docs.rev;
          row.complete = data.complete;
        }
      });
      _todoEvents2.default.publish('itemUpdate');
    });
  }
  doc.onload = function () {
    _todoEvents2.default.publish('startSync');
  }();
});