(function start($) {
  const syncDom = $('#syncDom');
  const prompt = $('#prompt');
  const todoInput = $('#todoInput');
  const content = $('#listcontent');
  let time;

  $(document).on('emptyInput', onEmpty);
  $(document).on('startSync', onStartSync);
  $(document).on('itemUpdate', itemUpdate);
  $(document).on('click', '#addButton', onAdd);
  $(document).on('click', '.delete', onDelete);

  function onAdd() {
    if (todoInput.val().trim() === '') {
      onEmpty();
    } else {
      $(document).trigger('itemAdd', todoInput.val());
    }
  }

  function onDelete(e) {
    // todo 确认弹窗
    $(document).trigger('itemDelete', {
      row: {
        id: $(e.target).attr('id'),
        rev: $(e.target).attr('rev'),
      },
    });
  }

  function onEmpty() {
    if (time) {
      clearTimeout(time);
    }
    prompt.text('内容不可为空').css('color', 'red');
    time = setTimeout(() => {
      time = '';
      prompt.text('');
    }, 2000);
  }


  function onStartSync() {
    syncDom.val('syncing');
    $(document).trigger('firstSyncComplete');
  }

  function itemUpdate(e, {
    rows,
  }) {
    content.children().remove();
    let todoLists = '';
    todoInput.val('');
    if (rows.length > 0) {
      rows.forEach((row) => {
        const {
          doc: {
            complete,
            title,
            date,
          },
        } = row;
        const todolist = `<tr>
        <td>
          <input type='checkbox' class="complete" ${complete ? 'checked' : ''} >
        </td>
        <td>
          ${title}
        </td>
        <td>
          ${date}
        </td>
        <td>
          <button class='delete' id=${row.id} rev=${row.doc._rev}>x</button>
        </td>
      </tr>`;
        todoLists += todolist;
      });
    }
    content.append($(todoLists));
  }
}(jQuery));
