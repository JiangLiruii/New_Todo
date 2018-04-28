(function start($) {
  const syncDom = $('#syncDom');
  const prompt = $('#prompt');
  const todoInput = $('#todoInput');
  const content = $('#listcontent');
  // 用于计数
  let time;

  $(document).bind({
    emptyInput: onEmpty,
    startSync: onStartSync,
    itemUpdate,
    click: onClickFunc,
  });

  function onClickFunc(e) {
    if (e.target.className === 'delete') {
      onDelete(e.target);
    } else if (e.target.className === 'complete') {
      onComplete(e.target);
    } else if (e.target.id === 'addButton') {
      onAdd();
    } else if (e.target.id === 'completeSelect') {
      onSelectChange(e.target);
    }
  }

  function onAdd() {
    if (todoInput.val().trim() === '') {
      onEmpty();
    } else {
      $(document).trigger('itemAdd', todoInput.val());
    }
  }

  function onDelete(ele) {
    // todo 确认弹窗
    const tr = $(ele).parents('tr');
    $(document).trigger('itemDelete', {
      row: {
        id: tr.attr('_id'),
        rev: tr.attr('_rev'),
      },
    });
  }

  function onComplete(ele) {
    const tr = $(ele).parents('tr');
    const statue = $(ele).attr('checked');
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

  function onSelectChange(ele) {
    const select = ele.value;
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
