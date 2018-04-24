(function start($) {
  const db = new PouchDB('todos');
  const remoteCouch = 'https://fcc9803d-0f80-4217-9b12-dd98150bbf3d-bluemix.cloudant.com/todos';
  const syncDom = $('#syncDom');

  function update() {
    $(document).trigger('selectUpdate');
  }

  function sync() {
    syncDom.val('syncing now');
    const opts = {
      live: true,
    };
    db.replicate.to(remoteCouch, opts, syncError);
    db.replicate.from(remoteCouch, opts, syncError);
  }

  function addList() {
    const todo = $('#todoInput').val().trim();
    if (todo === '') {
      // 弹出提示框输入待办项
      $(document).trigger('emptyInput');
    } else {
      const data = {
        _id: '',
      };
      const addDate = new Date();
      data.complete = false;
      data._id = addDate.toISOString();
      data.title = todo;
      data.date = addDate.toDateString();
      db.put(data, (err) => {
        if (!err) {
          update();
        } else {
          console.error('something error', err);
        }
      });
    }
  }
  $(document).ready(() => {
    $('#addButton').on('click', addList);
    $('#completeSelect').on('change', update);
  });
}(jQuery));
