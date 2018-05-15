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

  _todoEvents.todoEvent.subscribe('onSyncRecieve', sync); /**
                                                           * 用于数据相关的操作,包括
                                                           * 1 与数据库的同步
                                                           * 2 数据项的增加,删除和修改
                                                           */

  _todoEvents.todoEvent.subscribe('itemDelete', onItemDelete);
  _todoEvents.todoEvent.subscribe('itemChange', onItemDataChange);
  _todoEvents.todoEvent.subscribe('itemAdd', onitemAdd);
  /**
   * 与数据库同步,获取初始数据保存到缓存中
   */
  function sync() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _todoEvents.db.allDocs({
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
      _todoEvents.todoEvent.setTodoRows(rowsSend);
      _todoEvents.todoEvent.publish('itemUpdate');
    });
  }
  /**
   * 当数据项增加时调用
   */
  function onitemAdd(data) {
    _todoEvents.db.put(data, function (err, res) {
      if (!err) {
        data._rev = res.rev;
        var complete = data.complete,
            title = data.title,
            date = data.date,
            finishDate = data.finishDate,
            _rev = data._rev,
            _id = data._id;

        _todoEvents.todoEvent.getTodoRows().unshift({
          complete: complete,
          title: title,
          date: date,
          finishDate: finishDate,
          _rev: _rev,
          _id: _id
        });
        _todoEvents.todoEvent.publish('itemUpdate');
      } else {
        console.error('something error', err);
      }
    });
  }
  /**
   * 当数据项删除时调用
   */
  function onItemDelete(data) {
    var rows = _todoEvents.todoEvent.getTodoRows();
    _todoEvents.db.remove(data.id, data.rev).then(function () {
      rows.forEach(function (row) {
        if (row._id === data.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      _todoEvents.todoEvent.publish('itemUpdate');
    });
  }
  /**
   * 当数据项改变时调用
   */
  function onItemDataChange(data) {
    _todoEvents.db.put(data).then(function (docs) {
      _todoEvents.todoEvent.getTodoRows().forEach(function (row) {
        if (row._id === data._id) {
          row.date = data.date;
          row.title = data.title;
          row.finishDate = data.finishDate;
          row._rev = docs.rev;
          row.complete = data.complete;
        }
      });
      _todoEvents.todoEvent.publish('itemUpdate');
    });
  }
  _todoEvents.doc.onload = function () {
    _todoEvents.todoEvent.publish('startSync');
  }();
});