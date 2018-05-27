/**
 * 用于数据相关的操作,包括
 * 1 与数据库的同步
 * 2 数据项的增加,删除和修改
 */
import todoEvent from './todoEvents';

const db = new PouchDB('todos');
const doc = document;

todoEvent.subscribe('onSyncRecieve', sync);
todoEvent.subscribe('itemDelete', onItemDelete);
todoEvent.subscribe('itemChange', onItemDataChange);
todoEvent.subscribe('itemAdd', onitemAdd);
/**
 * 与数据库同步,获取初始数据保存到缓存中
 */
function sync(data = {}) {
  db.allDocs({
    include_docs: true,
    descending: true,
  }, (err, docs) => {
    const rowsSend = [];
    docs.rows.forEach((row) => {
      const {
        complete,
        addDate,
        finishDate,
      } = data;
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
    todoEvent.setTodoRows(rowsSend);
    todoEvent.publish('itemUpdate');
  });
}
/**
 * 当数据项增加时调用
 */
function onitemAdd(data) {
  db.put(data, (err, res) => {
    if (!err) {
      data._rev = res.rev;
      todoEvent.getTodoRows().unshift(data);
      todoEvent.publish('itemUpdate');
    } else {
      console.error('something error', err);
    }
  });
}
/**
 * 当数据项删除时调用
 */
function onItemDelete(data) {
  const rows = todoEvent.getTodoRows();
  db.remove(data.id, data.rev)
    .then(() => {
      rows.forEach((row) => {
        if (row._id === data.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      todoEvent.publish('itemUpdate');
    });
}
/**
 * 当数据项改变时调用
 */
function onItemDataChange(data) {
  db.put(data).then((docs) => {
    todoEvent.getTodoRows().forEach((row) => {
      if (row._id === data._id) {
        row.date = data.date;
        row.title = data.title;
        row.finishDate = data.finishDate;
        row._rev = docs.rev;
        row.complete = data.complete;
      }
    });
    todoEvent.publish('itemUpdate');
  });
}
doc.onload = (() => {
  todoEvent.publish('startSync');
})();
