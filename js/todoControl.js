import { doc, startSync, itemUpdate, db, itemAdd, ItemDelete, onSyncRecieve, itemChange } from './todoEvents';

doc.addEventListener('onSyncRecieve', sync);
doc.addEventListener('itemDelete', onItemDelete);
doc.addEventListener('itemChange', onItemDataChange);
doc.addEventListener('itemAdd', onitemAdd);

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

function onItemDelete() {
  const data = ItemDelete.detail.data;
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
