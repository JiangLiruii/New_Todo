const db = new PouchDB('todos');
const itemUpdate = new CustomEvent('itemUpdate', { detail: {} });
const startSync = new CustomEvent('startSync');

doc.addEventListener('onSyncRecieve', sync);
doc.addEventListener('itemDelete', onItemDelete);
doc.addEventListener('itemCompleteChange', onCompleteChange);
doc.addEventListener('itemAdd', onitemAdd);

function sync() {
  db.allDocs({
    include_docs: true,
    descending: true,
  }, (err, docs) => {
    const totalRows = docs.rows.length;
    const pages = Math.ceil(totalRows / 10);
    itemUpdate.detail.rows = docs.rows;
    itemUpdate.detail.pages = pages;
    doc.dispatchEvent(itemUpdate);
  });
}

function onitemAdd() {
  const todo = doc.getElementById('todoInput').value;
  const finishDate = doc.getElementById('finishDate').value;
  const addDate = new Date();
  const newMonth = addDate.getMonth() < 10 ? `0${addDate.getMonth()}` : addDate.getMonth();
  const newDate = addDate.getDate() < 10 ? `0${addDate.getDate()}` : addDate.getDate();
  const data = {
    _id: addDate.toISOString(),
    title: todo,
    date: `${addDate.getFullYear()}-${newMonth}-${newDate}`,
    finishDate: finishDate || '无期限',
    complete: false,
  };

  db.put(data, (err, res) => {
    if (!err) {
      sync();
      console.log(res);
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

function onCompleteChange(e) {
  const {
    _id,
    _rev,
    date,
    title,
    statue,
    finishDate,
  } = e.detail;
  db.put({
    _id,
    _rev,
    date,
    title,
    complete: !statue,
    finishDate,
  }).then(() => {
    sync();
  });
}

doc.onload = (() => {
  doc.dispatchEvent(startSync);
})();
