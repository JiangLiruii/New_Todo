const doc = document;
const syncDom = doc.getElementById('syncDom');
const prompt = doc.getElementById('prompt');
const todoInput = doc.getElementById('todoInput');
const content = doc.getElementById('content');
const completeChange = doc.getElementById('completeSelect');
const title = doc.getElementById('title');
// 用于计数
let time;
// 用于升降序
let descending = false;

const itemAdd = new CustomEvent('itemAdd');
const itemDelete = new CustomEvent('itemDelete', {
  detail: {},
});
const onSyncRecieve = new CustomEvent('onSyncRecieve');
const itemCompleteChange = new CustomEvent('itemCompleteChange', {
  detail: {},
});

doc.addEventListener('startSync', onStartSync);
doc.addEventListener('itemUpdate', onitemUpdate);
doc.addEventListener('click', onClickFunc);
completeChange.addEventListener('change', onSelectChange);
title.addEventListener('click', onTitleClick);


function onClickFunc(e) {
  if (e.target.parentNode.className === 'itemDelete') {
    onDelete(e.target);
  } else if (e.target.parentNode.className === 'itemComplete') {
    onComplete(e.target);
  } else if (e.target.id === 'addButton') {
    onAdd();
  } else if (e.target.className === 'pages') {
    onPageClick(e.target);
  }
}

function onPageClick(element) {
  let nextPage = +element.getAttribute('page');
  switch (nextPage) {
    case 0:
      nextPage = 1;
      break;
    case -1:
      nextPage = +itemUpdate.detail.pages;
      break;
    default:
      break;
  }

  itemUpdate.detail.currentPage = nextPage;
  onitemUpdate();
}

function onTitleClick(e) {
  // 根据e.target.class来排序
  const className = `_${e.target.className.replace('item', '').toLowerCase()}`;
  const sortedContent = Array.from(doc.getElementsByClassName('contentWrap'));
  const oldContent = doc.getElementById('content');
  oldContent.innerHTML = '';

  if (!descending) {
    sortedContent.sort((itemA, itemB) =>
      (itemA.getAttribute(className) > itemB.getAttribute(className)));
    descending = true;
  } else {
    sortedContent.sort((itemA, itemB) =>
      (itemA.getAttribute(className) < itemB.getAttribute(className)));
    descending = false;
  }
  sortedContent.map((item) => {
    oldContent.appendChild(item);
  });
}

function onAdd() {
  if (todoInput.value.trim() === '') {
    onEmpty();
  } else {
    doc.dispatchEvent(itemAdd);
  }
}

function onDelete(ele) {
  // todo 确认弹窗
  const tr = ele.parentNode.parentNode;
  itemDelete.detail.id = tr.getAttribute('_id');
  itemDelete.detail.rev = tr.getAttribute('_rev');
  doc.dispatchEvent(itemDelete);
}

function onComplete(ele) {
  const tr = ele.parentNode.parentNode;
  const statue = ele.hasAttribute('checked');
  itemCompleteChange.detail.statue = statue;
  itemCompleteChange.detail._rev = tr.getAttribute('_rev');
  itemCompleteChange.detail._id = tr.getAttribute('_id');
  itemCompleteChange.detail.date = tr.getAttribute('_date');
  itemCompleteChange.detail.title = tr.getAttribute('_title');
  itemCompleteChange.detail.finishDate = tr.getAttribute('_finishDate');
  doc.dispatchEvent(itemCompleteChange);
}

function onSelectChange(e) {
  const select = e.target.value;
  const completeTd = content.getElementsByClassName('itemComplete');

  e.stopPropagation();
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
  doc.dispatchEvent(onSyncRecieve);
}

function onitemUpdate() {
  const pages = itemUpdate.detail.pages;
  const currentPage = itemUpdate.detail.currentPage || 1;
  const rows = itemUpdate.detail.rows.slice((currentPage - 1) * 10, currentPage * 10);
  let todoLists = '';
  content.innerHTML = '';
  todoInput.value = '';
  doc.getElementById('finishDate').value = '';
  if (rows.length > 0) {
    rows.forEach((row) => {
      todoLists += domSync(row);
    });
  }
  content.innerHTML = todoLists + paginate(pages, currentPage);
  syncDom.innerText = 'SYNCED';
}

function paginate(pages, currentPage) {
  let pagination = '<br><span page="0" class="pages"><<</span>';
  for (let i = 1; i <= pages; i += 1) {
    if (i === currentPage) {
      pagination += `<span page="${i}" class="pages active">${i}</span>`;
    } else {
      pagination += `<span page="${i}" class="pages">${i}</span>`;
    }
  }
  pagination += '<span page="-1" class="pages">>></span>';
  return pagination;
}

function domSync(row) {
  const {
    doc: {
      complete,
      title,
      date,
      finishDate,
      _rev,
    },
    id,
  } = row;
  return `<div class="contentWrap"  _complete=${complete} _title=${title} _date=${date} _finishDate=${finishDate}  _id=${id} _rev=${_rev}>
  <span class="itemComplete"><input type='checkbox' ${complete ? 'checked' : ''} ></span>
  <span class="itemTitle">${title}</span>
  <span class="itemDate">${date}</span>
  <span class="itemFinishDate">${finishDate}</span>
  <span class='itemDelete'><button>x</button></span>
</div>`;
}
