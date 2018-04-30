const syncDom = document.getElementById('syncDom');
const prompt = document.getElementById('prompt');
const todoInput = document.getElementById('todoInput');
const content = document.getElementById('content');
const completeChange = document.getElementById('completeSelect')
// 用于计数
let time;

const itemAdd = new CustomEvent('itemAdd');
const itemDelete = new CustomEvent('itemDelete', { detail: {} })
const onSyncRecieve = new CustomEvent('onSyncRecieve');
const emptyInput = new CustomEvent('emptyInput');
const startSync = new CustomEvent('startSync');
const itemCompleteChange = new CustomEvent('itemCompleteChange', {
  detail: {},
});

document.addEventListener('emptyInput', onEmpty);
document.addEventListener('startSync', onStartSync);
document.addEventListener('itemUpdate', onitemUpdate);
completeChange.addEventListener('change', onSelectChange)
document.addEventListener('click', onClickFunc, true);

function onClickFunc(e) {
  if (e.target.parentNode.className === 'itemDelete') {
    onDelete(e.target);
  } else if (e.target.parentNode.className === 'itemComplete') {
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
  itemDelete.detail.id = tr.getAttribute('_id');
  itemDelete.detail.rev = tr.getAttribute('_rev');
  document.dispatchEvent(itemDelete);
}

function onComplete(ele) {
  const tr = ele.parentNode.parentNode;
  const statue = ele.hasAttribute('checked');
  itemCompleteChange.detail.statue = statue;
  itemCompleteChange.detail._rev = tr.getAttribute('_rev');
  itemCompleteChange.detail._id = tr.getAttribute('_id');
  itemCompleteChange.detail.date = tr.getAttribute('_date');
  itemCompleteChange.detail.title = tr.getAttribute('_title');
  document.dispatchEvent(itemCompleteChange);
}

function onSelectChange(e) {
  const select = e.target.value;
  const completeTd = content.getElementsByClassName('itemComplete');

  e.stopPropagation()
  Array.from(completeTd).forEach((item) => {
    todo = item.parentNode;
    if (select === 'completed') {
      todo.style.display = 'none';
      if (item.childNodes[0].hasAttribute('checked')) {
        todo.style.display = '';
      }
    } else if (select === 'unCompleted') {
      todo.style.display = '';
      if (item.childNodes[0].hasAttribute('checked')) {
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
  let rows = e.detail.rows;
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
          finishDate
        },
      } = row;
      const todolist = `<div id="contentWrap"  _title=${title} _date=${date} _id=${row.id} _rev=${row.doc._rev}>
          <span class="itemComplete"><input type='checkbox' ${complete ? 'checked' : ''} ></span>
          <span class="itemDescription">${title}</span>
          <span class="itemDate">${date}</span>
          <span class="itemFinishDate">${finishDate}</span>
          
          <span class='itemDelete'><button>x</button></span>
      </div>`;
      todoLists += todolist;
    });
  }
  content.innerHTML = todoLists;
}
