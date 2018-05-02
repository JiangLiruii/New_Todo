const db = new PouchDB('todos');
const itemUpdate = new CustomEvent('itemUpdate', { detail: {} });

doc.addEventListener('onSyncRecieve', sync);
doc.addEventListener('itemDelete', onDbDelete);
doc.addEventListener('itemCompleteChange', onCompleteChange);
doc.addEventListener('itemAdd', onitemAdd);

function sync() {
  db.allDocs({
    include_docs: true,
    descending: true,
  }, (err, docs) => {
    itemUpdate.detail.rows = docs.rows;
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
