const syncDom = document.getElementById('syncDom');
const prompt = document.getElementById('prompt');
const todoInput = document.getElementById('todoInput');
const content = document.getElementById('listcontent');
const completeChange = document.getElementById('completeSelect')
// 用于计数
let time;
let itemAdd = new CustomEvent('itemAdd');


// document.addEventListener({
//   emptyInput: onEmpty,
//   startSync: onStartSync,
//   itemUpdate,
//   click: onClickFunc,
// });
let emptyInput = new Event('emptyInput', { bubbles: false, cancelable: false });
let startSync = new Event('startSync', { bubbles: false, cancelable: false });
document.addEventListener('emptyInput', onEmpty);
document.addEventListener('startSync', onStartSync);
document.addEventListener('itemUpdate', onitemUpdate);
completeChange.addEventListener('change', onSelectChange)
document.addEventListener('click', onClickFunc);

function onClickFunc(e) {
  if (e.target.className === 'delete') {
    onDelete(e.target);
  } else if (e.target.className === 'complete') {
    onComplete(e.target);
  } else if (e.target.id === 'addButton') {
    onAdd();
  }
}

function onAdd() {
  if (todoInput.value.trim() === '') {
    onEmpty();
  } else {
    document.dispatchEvent(itemAdd);
  }
}

function onDelete(ele) {
  // todo 确认弹窗
  const tr = ele.parentNode.parentNode;
  let itemDelete = new CustomEvent('itemDelete', {
    detail: {
      id: tr.getAttribute('_id'),
      rev: tr.getAttribute('_rev'),
    }
  });

  document.dispatchEvent(itemDelete);
}

function onComplete(ele) {
  const tr = ele.parentNode.parentNode;
  const statue = ele.getAttribute('checked');
  let itemCompleteChange = new CustomEvent('itemCompleteChange', {
    detail: {
      statue,
      _rev: tr.getAttribute('_rev'),
      _id: tr.getAttribute('_id'),
      date: tr.getAttribute('_date'),
      title: tr.getAttribute('_title'),
    }
  });

  document.dispatchEvent(itemCompleteChange);
}

function onSelectChange(e) {
  const select = e.target.value;
  const completeTd = content.getElementsByClassName('complete');

  Array.from(completeTd).forEach((item) => {
    todo = item.parentNode.parentNode;
    if (select === 'completed') {
      todo.style.display = 'none';
      if (item.hasAttribute('checked')) {
        todo.style.display = '';
      }
    } else if (select === 'unCompleted') {
      todo.style.display = '';
      if (item.hasAttribute('checked')) {
        todo.style.display = 'none';
      }
    } else {
      todo.style.display = '';
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
  syncDom.innerText = 'SYNCING';
  document.dispatchEvent(onSyncRecieve);
}

function onitemUpdate(e) {
  let rows = e.detail;
  let todoLists = '';
  syncDom.innerText = 'SYNCED';
  content.innerHTML = '';

  todoInput.value = '';
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
  content.innerHTML = todoLists;
}
