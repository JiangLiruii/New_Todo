(function start($) {
  const db = new PouchDB('todos');

  $(document).on('firstSyncComplete', sync);
  $(document).on('itemDelete', onDbDelete);
  $(document).on('itemCompleteChange', onCompleteChange);

  function sync() {
    db.allDocs({
      include_docs: true,
      descending: true,
    }, (err, doc) => {
      $(document).trigger('itemUpdate', {
        rows: doc.rows,
      });
    });
  }

  function itemAdd() {
    const todo = $('#todoInput').val().trim();
    const data = {
      _id: '',
    };
    const addDate = new Date();
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

  function onDbDelete(e, {
    row,
  }) {
    db.remove(row.id, row.rev)
      .then(() => {
        sync();
      });
  }

  function onCompleteChange(e, {
    doc: {
      statue,
      _rev,
      _id,
      date,
      title,
    },
  }) {
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

  $(document).ready(() => {
    $(document).trigger('startSync');
    $(document).on('itemAdd', itemAdd);
  });
}(jQuery));
