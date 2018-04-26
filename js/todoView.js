(function start($) {
  const syncDom = $('#syncDom');
  const prompt = $('#prompt');
  const todoInput = $('#todoInput');
  const content = $('#listcontent');
  // 用于计数
  let time;

  $(document).on('emptyInput', onEmpty);
  $(document).on('startSync', onStartSync);
  $(document).on('itemUpdate', itemUpdate);
  $(document).on('click', '#addButton', onAdd);
  $(document).on('click', '.delete', onDelete);
  $(document).on('click', '.complete', onComplete);
  $(document).on('change', '#completeSelect', onSelectChange);

  function onAdd() {
    if (todoInput.val().trim() === '') {
      onEmpty();
    } else {
      $(document).trigger('itemAdd', todoInput.val());
    }
  }

  function onDelete(e) {
    // todo 确认弹窗
    const tr = $(e.target).parents('tr');
    $(document).trigger('itemDelete', {
      row: {
        id: tr.attr('_id'),
        rev: tr.attr('_rev'),
      },
    });
  }

  function onComplete(e) {
    const tr = $(e.target).parents('tr');
    const statue = $(e.target).attr('checked');
    $(document).trigger('itemCompleteChange', {
      doc: {
        statue,
        _rev: tr.attr('_rev'),
        _id: tr.attr('_id'),
        date: tr.attr('_date'),
        title: tr.attr('_title'),
      },
    });
  }

  function onSelectChange(e) {
    e.stopPropagation();
    const select = e.target.value;
    const completeTd = content.find('.complete');
    completeTd.each((index, item) => {
      todo = $(item).parents('tr');
      if (select === 'completed') {
        todo.hide();
        if ($(item).attr('checked') === 'checked') {
          todo.show();
        }
      } else if (select === 'unCompleted') {
        todo.show();
        if ($(item).attr('checked') === 'checked') {
          todo.hide();
        }
      } else {
        todo.show();
      }
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
    syncDom.text('SYNCING');
    $(document).trigger('onSyncRecieve');
  }

  function itemUpdate(e, {
    rows,
  }) {
    syncDom.text('SYNCED');
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
        const todolist = `<tr _title=${title} _date=${date} _id=${row.id} _rev=${row.doc._rev}>
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
          <button class='delete'>x</button>
        </td>
      </tr>`;
        todoLists += todolist;
      });
    }
    content.append($(todoLists));
  }
}(jQuery));
