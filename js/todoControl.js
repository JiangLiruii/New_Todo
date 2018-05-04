const db = new PouchDB('todos');
const itemUpdate = new CustomEvent('itemUpdate', { detail: {} });
const itemChanged = new CustomEvent('itemChanged', { detail: {} });
const startSync = new CustomEvent('startSync');

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
      if (complete === 'all' && dateBoolean) {
        rowsSend.push(row);
      } else if (row.doc.complete === (complete === 'completed') && dateBoolean) {
        rowsSend.push(row);
      }
    });

    const totalRows = rowsSend.length;
    itemUpdate.detail.rows = rowsSend;
    itemUpdate.detail.pages = Math.ceil(totalRows / 10);
    doc.dispatchEvent(itemUpdate);
  });
}

function onitemAdd() {
  const todo = doc.getElementById('todoInput').value;
  const finishDate = doc.getElementById('finishDate').value;
  const addDate = new Date();
  const month = addDate.getMonth() + 1;
  const date = addDate.getDate();
  const newMonth = month < 10 ? `0${month}` : month;
  const newDate = date < 10 ? `0${date}` : date;
  const data = {
    _id: addDate.toISOString(),
    title: todo,
    date: `${addDate.getFullYear()}-${newMonth}-${newDate}`,
    finishDate: finishDate || null,
    complete: false,
  };

  db.put(data, (err) => {
    if (!err) {
      sync();
    } else {
      console.error('something error', err);
    }
  });
}

function onItemDelete(e) {
  const row = e.detail;
  db.remove(row.id, row.rev)
    .then(() => {
      sync();
    });
}

function onItemDataChange(e) {
  const {
    _id,
    _rev,
    date,
    title,
    complete,
    finishDate,
  } = e.detail;
  db.put({
    _id,
    _rev,
    date,
    title,
    complete,
    finishDate,
  }).then((docs) => {
    itemChanged.detail.rev = docs.rev;
    doc.dispatchEvent(itemChanged);
  });
}

doc.onload = (() => {
  doc.dispatchEvent(startSync);
})();
