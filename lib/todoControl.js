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

  _todoEvents.doc.addEventListener('onSyncRecieve', sync);
  _todoEvents.doc.addEventListener('itemDelete', onItemDelete);
  _todoEvents.doc.addEventListener('itemChange', onItemDataChange);
  _todoEvents.doc.addEventListener('itemAdd', onitemAdd);

  function sync() {
    _todoEvents.db.allDocs({
      include_docs: true,
      descending: true
    }, function (err, docs) {
      var _onSyncRecieve$detail = _todoEvents.onSyncRecieve.detail.data,
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
      _todoEvents.itemUpdate.detail.rows = rowsSend;
      _todoEvents.doc.dispatchEvent(_todoEvents.itemUpdate);
    });
  }

  function onitemAdd() {
    var data = _todoEvents.itemAdd.detail.data;
    _todoEvents.db.put(data, function (err, res) {
      if (!err) {
        data._rev = res.rev;
        var complete = data.complete,
            title = data.title,
            date = data.date,
            finishDate = data.finishDate,
            _rev = data._rev,
            _id = data._id;

        _todoEvents.itemUpdate.detail.rows.unshift({
          complete: complete,
          title: title,
          date: date,
          finishDate: finishDate,
          _rev: _rev,
          _id: _id
        });
        _todoEvents.doc.dispatchEvent(_todoEvents.itemUpdate);
      } else {
        console.error('something error', err);
      }
    });
  }

  function onItemDelete() {
    var data = _todoEvents.ItemDelete.detail.data;
    _todoEvents.db.remove(data.id, data.rev).then(function () {
      rows.forEach(function (row) {
        if (row._id === data.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      _todoEvents.doc.dispatchEvent(_todoEvents.itemUpdate);
    });
  }

  function onItemDataChange() {
    var _itemChange$detail$da = _todoEvents.itemChange.detail.data,
        _id = _itemChange$detail$da._id,
        _rev = _itemChange$detail$da._rev,
        date = _itemChange$detail$da.date,
        title = _itemChange$detail$da.title,
        complete = _itemChange$detail$da.complete,
        finishDate = _itemChange$detail$da.finishDate;

    _todoEvents.db.put({
      _id: _id,
      _rev: _rev,
      date: date,
      title: title,
      complete: complete,
      finishDate: finishDate
    }).then(function (docs) {
      _todoEvents.itemUpdate.detail.rows.forEach(function (row) {
        if (row._id === _id) {
          row.date = date;
          row.title = title;
          row.finishDate = finishDate;
          row._rev = docs.rev;
          row.complete = complete;
        }
      });
      _todoEvents.doc.dispatchEvent(_todoEvents.itemUpdate);
    });
  }
  _todoEvents.doc.onload = function () {
    _todoEvents.doc.dispatchEvent(_todoEvents.startSync);
  }();
});