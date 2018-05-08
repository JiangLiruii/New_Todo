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

  var doc = _todoEvents2.default.doc,
      startSync = _todoEvents2.default.startSync,
      itemUpdate = _todoEvents2.default.itemUpdate,
      db = _todoEvents2.default.db,
      itemAdd = _todoEvents2.default.itemAdd,
      itemDelete = _todoEvents2.default.itemDelete,
      onSyncRecieve = _todoEvents2.default.onSyncRecieve,
      itemChange = _todoEvents2.default.itemChange;

  doc.addEventListener('onSyncRecieve', sync);
  doc.addEventListener('itemDelete', onItemDelete);
  doc.addEventListener('itemChange', onItemDataChange);
  doc.addEventListener('itemAdd', onitemAdd);
  /**
   * 与数据库同步,获取初始数据保存到缓存中
   */
  function sync() {
    db.allDocs({
      include_docs: true,
      descending: true
    }, function (err, docs) {
      var _onSyncRecieve$detail = onSyncRecieve.detail.data,
          complete = _onSyncRecieve$detail.complete,
          addDate = _onSyncRecieve$detail.addDate,
          finishDate = _onSyncRecieve$detail.finishDate;

      var rowsSend = [];
      docs.rows.forEach(function (row) {
        var dateBoolean = (!addDate || row.doc.date === addDate) && (!finishDate || row.doc.finishDate === finishDate);
        if (complete === 'all' && !addDate && !finishDate) {
          rowsSend.push(row.doc);
        } else if (complete === 'all' && dateBoolean) {
          rowsSend.push(row.doc);
        } else if (row.doc.complete === (complete === 'completed') && dateBoolean) {
          rowsSend.push(row.doc);
        }
      });
      itemUpdate.detail.rows = rowsSend;
      doc.dispatchEvent(itemUpdate);
    });
  }
  /**
   * 当数据项增加时调用
   */
  function onitemAdd() {
    var data = itemAdd.detail.data;
    db.put(data, function (err, res) {
      if (!err) {
        data._rev = res.rev;
        var complete = data.complete,
            title = data.title,
            date = data.date,
            finishDate = data.finishDate,
            _rev = data._rev,
            _id = data._id;

        itemUpdate.detail.rows.unshift({
          complete: complete,
          title: title,
          date: date,
          finishDate: finishDate,
          _rev: _rev,
          _id: _id
        });
        doc.dispatchEvent(itemUpdate);
      } else {
        console.error('something error', err);
      }
    });
  }
  /**
   * 当数据项删除时调用
   */
  function onItemDelete() {
    var data = itemDelete.detail.data;
    var rows = itemUpdate.detail.rows;
    db.remove(data.id, data.rev).then(function () {
      rows.forEach(function (row) {
        if (row._id === data.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      doc.dispatchEvent(itemUpdate);
    });
  }
  /**
   * 当数据项改变时调用
   */
  function onItemDataChange() {
    var _itemChange$detail$da = itemChange.detail.data,
        _id = _itemChange$detail$da._id,
        _rev = _itemChange$detail$da._rev,
        date = _itemChange$detail$da.date,
        title = _itemChange$detail$da.title,
        complete = _itemChange$detail$da.complete,
        finishDate = _itemChange$detail$da.finishDate;

    db.put({
      _id: _id,
      _rev: _rev,
      date: date,
      title: title,
      complete: complete,
      finishDate: finishDate
    }).then(function (docs) {
      itemUpdate.detail.rows.forEach(function (row) {
        if (row._id === _id) {
          row.date = date;
          row.title = title;
          row.finishDate = finishDate;
          row._rev = docs.rev;
          row.complete = complete;
        }
      });
      doc.dispatchEvent(itemUpdate);
    });
  }
  doc.onload = function () {
    doc.dispatchEvent(startSync);
  }();
});