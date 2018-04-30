const db = new PouchDB('todos');
const itemUpdate = new CustomEvent('itemUpdate', { detail: {} });

document.addEventListener('onSyncRecieve', sync);
document.addEventListener('itemDelete', onDbDelete);
document.addEventListener('itemCompleteChange', onCompleteChange);
document.addEventListener('itemAdd', onitemAdd);

function sync() {
  db.allDocs({
    include_docs: true,
    descending: true,
  }, (err, doc) => {
    itemUpdate.detail.rows = doc.rows;
    document.dispatchEvent(itemUpdate);
  });
}

function onitemAdd() {
  const todo = document.getElementById('todoInput').value;
  const finishDate = document.getElementById('finishDate').value;
  const addDate = new Date();
  const data = {
    _id: addDate.toISOString(),
    title: todo,
    date: `${addDate.getFullYear()}-${addDate.getMonth()}-${addDate.getDate()}`,
    finishDate,
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

function onDbDelete(e) {
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
  } = e.detail;
  db.put({
    _id,
    _rev,
    date,
    title,
    complete: !statue,
  }).then(() => {
    sync();
  });
}

document.onload = (() => {
  document.dispatchEvent(startSync);
})();
