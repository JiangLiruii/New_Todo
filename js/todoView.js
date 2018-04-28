const syncDom = document.getElementById('syncDom');
const prompt = document.getElementById('prompt');
const todoInput = document.getElementById('todoInput');
const content = document.getElementById('listcontent');
// 用于计数
let time;

// document.addEventListener({
//   emptyInput: onEmpty,
//   startSync: onStartSync,
//   itemUpdate,
//   click: onClickFunc,
// });
document.addEventListener('emptyInput', onEmpty);
document.addEventListener('startSync', onStartSync);
document.addEventListener('itemUpdate', itemUpdate);
document.addEventListener('click', onClickFunc);

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
  if (todoInput.value.trim() === '') {
    onEmpty();
  } else {
    document.dispatchEvent('itemAdd', todoInput.value);
  }
}

function onDelete(ele) {
  // todo 确认弹窗
  const tr = $(ele).parentNode.parentNode;

  document.dispatchEvent('itemDelete', {
    row: {
      id: tr.attr('_id'),
      rev: tr.attr('_rev'),
    },
  });
}

function onComplete(ele) {
  const tr = $(ele).parentNode.parentNode;
  const statue = $(ele).attr('checked');

  document.dispatchEvent('itemCompleteChange', {
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
  const completeTd = content.getElementsByClassName('complete');

  completeTd.forEach((item) => {
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
  prompt.innerText = '内容不可为空';
  prompt.style.color = 'red';
  time = setTimeout(() => {
    time = '';
    prompt.innerText = '';
  }, 2000);
}


function onStartSync() {
  syncDom.text('SYNCING');
  document.dispatchEvent('onSyncRecieve');
}

function itemUpdate(e, {
  rows,
}) {
  let todoLists = '';

  syncDom.text('SYNCED');
  content.children().remove();

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
