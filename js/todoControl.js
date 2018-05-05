const db = new PouchDB('todos');
const itemUpdate = new CustomEvent('itemUpdate', { detail: {} });
const itemChanged = new CustomEvent('itemChanged', { detail: {} });
const startSync = new CustomEvent('startSync');
const itemDeleted = new CustomEvent('itemDeleted', { detail: {} });
const itemAdded = new CustomEvent('itemAdded', { detail: {} });

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
    } = onSyncRecieve.detail;
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
  db.put(itemAdd.detail, (err, res) => {
    if (!err) {
      itemAdd.detail._rev = res.rev;
      const {
        complete,
        title,
        date,
        finishDate,
        _rev,
        _id,
      } = itemAdd.detail;
      itemUpdate.detail.rows.unshift({
        complete,
        title,
        date,
        finishDate,
        _rev,
        _id,
      });
      doc.dispatchEvent(itemAdded);
    } else {
      console.error('something error', err);
    }
  });
}

function onItemDelete() {
  const rows = itemUpdate.detail.rows;
  db.remove(itemDelete.detail.id, itemDelete.detail.rev)
    .then(() => {
      itemDeleted.detail.target = itemDelete.detail.source;
      rows.forEach((row) => {
        if (row._id === itemDelete.detail.id) {
          rows.splice(rows.indexOf(row), 1);
        }
      });
      doc.dispatchEvent(itemDeleted);
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
  } = itemChange.detail;
  db.put({
    _id,
    _rev,
    date,
    title,
    complete,
    finishDate,
  }).then((docs) => {
    itemChanged.detail.rev = docs.rev;
    itemUpdate.detail.rows.forEach((row) => {
      if (row._id === _id) {
        row.date = date;
        row.title = title;
        row.finishDate = finishDate;
        row._rev = docs.rev;
        row.complete = complete;
      }
    });
    doc.dispatchEvent(itemChanged);
  });
}
doc.onload = (() => {
  doc.dispatchEvent(startSync);
})();
