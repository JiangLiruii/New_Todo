/**
 * 用于数据相关的操作,包括
 * 1 与数据库的同步
 * 2 数据项的增加,删除和修改
 */
import { doc, startSync, itemUpdate, db, itemAdd, itemDelete, onSyncRecieve, itemChange } from './todoEvents';

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
    descending: true,
  }, (err, docs) => {
    const {
      complete,
      addDate,
      finishDate,
    } = onSyncRecieve.detail.data;
    const rowsSend = [];
    docs.rows.forEach((row) => {
      const dateBoolean = (!addDate || row.doc.date === addDate) &&
        (!finishDate || row.doc.finishDate === finishDate);
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
  const data = itemAdd.detail.data;
  db.put(data, (err, res) => {
    if (!err) {
      data._rev = res.rev;
      const {
        complete,
        title,
        date,
        finishDate,
        _rev,
        _id,
      } = data;
      itemUpdate.detail.rows.unshift({
        complete,
        title,
        date,
        finishDate,
        _rev,
        _id,
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
  const data = itemDelete.detail.data;
  const rows = itemUpdate.detail.rows;
  db.remove(data.id, data.rev)
    .then(() => {
      rows.forEach((row) => {
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
  const {
    _id,
    _rev,
    date,
    title,
    complete,
    finishDate,
  } = itemChange.detail.data;
  db.put({
    _id,
    _rev,
    date,
    title,
    complete,
    finishDate,
  }).then((docs) => {
    itemUpdate.detail.rows.forEach((row) => {
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
doc.onload = (() => {
  doc.dispatchEvent(startSync);
})();
