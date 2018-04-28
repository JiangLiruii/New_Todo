(function start($) {
  const db = new PouchDB('todos');

  $(document).bind({
    onSyncRecieve: sync,
    itemDelete: onDbDelete,
    itemCompleteChange: onCompleteChange,
    itemAdd,
  });

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
  });
}(jQuery));
