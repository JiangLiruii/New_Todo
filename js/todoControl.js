const db = new PouchDB('todos');

// document.on({
//   onSyncRecieve: sync,
//   itemDelete: onDbDelete,
//   itemCompleteChange: onCompleteChange,
//   itemAdd,
// });
let onSyncRecieve = new Event('onSyncRecieve', { bubbles: false, cancelable: false });

document.addEventListener('onSyncRecieve', sync);
document.addEventListener('itemDelete', onDbDelete);
document.addEventListener('itemCompleteChange', onCompleteChange);
document.addEventListener('itemAdd', onitemAdd);

function sync() {
  db.allDocs({
    include_docs: true,
    descending: true,
  }, (err, doc) => {
    let itemUpdate = new CustomEvent('itemUpdate', { 'detail': doc.rows });
    document.dispatchEvent(itemUpdate);
  });
}

function onitemAdd() {
  const todo = document.getElementById('todoInput').value;
  const addDate = new Date();
  const data = {
    _id: '',
    title: '',
    date: '',
  };

  data.complete = false;
  data._id = addDate.toISOString();
  data.title = todo;
  data.date = `${addDate.getFullYear()}-${addDate.getMonth()}-${addDate.getDate()}`;
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
  let row = e.detail;
  db.remove(row.id, row.rev)
    .then(() => {
      sync();
    });
}

function onCompleteChange(e) {
  console.log(e.detail);
  let {
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
