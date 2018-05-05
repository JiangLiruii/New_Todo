const doc = document;
const syncDom = doc.getElementById('syncDom');
const prompt = doc.getElementById('prompt');
const todoInput = doc.getElementById('todoInput');
const content = doc.getElementById('content');
const footer = doc.getElementsByTagName('footer')[0];
// 用于计时
let time;
// 用于升降序
let descending = false;

const itemAdd = new CustomEvent('itemAdd', { detail: {} });
const itemDelete = new CustomEvent('itemDelete', { detail: {} });
const onSyncRecieve = new CustomEvent('onSyncRecieve', { detail: {} });
const itemChange = new CustomEvent('itemChange', { detail: {} });

doc.addEventListener('startSync', onStartSync);
doc.addEventListener('itemUpdate', onitemUpdate);
doc.addEventListener('click', onClickFunc);
doc.addEventListener('change', onChangeFunc);
doc.addEventListener('itemChanged', onItemChanged);
doc.addEventListener('itemDeleted', onItemDeleted);
doc.addEventListener('itemAdded', onItemAdded);

function onChangeFunc(e) {
  if (e.target.parentNode.id === 'filter') {
    onFilterChange(e);
  } else if (e.target.parentNode.className === 'contentWrap') {
    onItemChange(e);
  }
}

function onClickFunc(e) {
  if (e.target.parentNode.className === 'itemDelete') {
    onDelete(e.target);
  } else if (e.target.id === 'addButton') {
    onAdd();
  } else if (e.target.className === 'pages') {
    onPageClick(e.target);
  } else if (e.target.parentNode.id === 'title') {
    onTitleClick(e);
  }
}

function onFilterChange(e) {
  if (e.target.id === 'filterAdd') {
    onSyncRecieve.detail.addDate = e.target.value;
  } else if (e.target.id === 'filterComplete') {
    onSyncRecieve.detail.finishDate = e.target.value;
  } else if (e.target.id === 'completeSelect') {
    onSyncRecieve.detail.complete = e.target.value;
  }
  doc.dispatchEvent(onSyncRecieve);
}

function onPageClick(element) {
  let nextPage = +element.getAttribute('page');
  switch (nextPage) {
    case 0:
      nextPage = 1;
      break;
    case -1:
      nextPage = Math.ceil(itemUpdate.detail.rows.length / 10);
      break;
    default:
      break;
  }

  itemUpdate.detail.currentPage = nextPage;
  onitemUpdate();
}

function onTitleClick(e) {
  // 根据e.target.class来排序
  let className = `${e.target.className.replace('item', '')}`;
  className = className[0].toLowerCase() + className.substr(1);

  const sortedContent = itemUpdate.detail.rows;
  if (!descending) {
    sortedContent.sort((itemA, itemB) => {
      console.log(itemA[className], itemB[className], itemA[className] > itemB[className]);
      return itemA[className] < itemB[className];
    });
    descending = true;
  } else {
    sortedContent.sort((itemA, itemB) => {
      console.log(itemA[className], itemB[className], itemA[className] < itemB[className]);
      return itemA[className] > itemB[className];
    });
    descending = false;
  }
  itemUpdate.detail.rows = sortedContent;
  doc.dispatchEvent(itemUpdate);
}

function onAdd() {
  const finishDate = doc.getElementById('finishDate').value;
  const date = new Date();
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  const newDate = `${date.getFullYear()}-${month}-${day}`;
  if (todoInput.value.trim() === '') {
    onEmpty();
  } else {
    itemAdd.detail._id = date.getTime().toString();
    itemAdd.detail.title = todoInput.value.trim();
    itemAdd.detail.date = newDate;
    itemAdd.detail.finishDate = finishDate || newDate;
    itemAdd.detail.complete = false;
    itemAdd.detail._rev = null;
    doc.dispatchEvent(itemAdd);
  }
}
function onItemAdded() {
  onitemUpdate();
}

function onDelete(ele) {
  // item 确认弹窗
  const item = ele.parentNode.parentNode;
  itemDelete.detail.id = item.getAttribute('_id');
  itemDelete.detail.rev = item.getAttribute('_rev');
  itemDelete.detail.source = item;
  doc.dispatchEvent(itemDelete);
}
function onItemDeleted() {
  onitemUpdate();
}

function onItemChange(e) {
  const item = e.target.parentNode;
  // 单击完成触发事件
  if (e.target.className === 'itemComplete') {
    itemChange.detail.complete = !item.children[0].hasAttribute('checked');
    item.setAttribute('_complete', itemChange.detail.complete);
  } else {
    itemChange.detail.complete = item.children[0].hasAttribute('checked');
  }
  itemChange.detail.target = item;
  itemChange.detail._rev = item.getAttribute('_rev');
  itemChange.detail._id = item.getAttribute('_id');
  itemChange.detail.title = item.children[1].value;
  itemChange.detail.date = item.children[2].value;
  itemChange.detail.finishDate = item.children[3].value;
  doc.dispatchEvent(itemChange);
}

function onItemChanged() {
  onitemUpdate();
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
  onSyncRecieve.detail.complete = 'all';
  onSyncRecieve.detail.addDate = '';
  onSyncRecieve.detail.finishDate = '';
  doc.dispatchEvent(onSyncRecieve);
}

function onitemUpdate() {
  const pages = Math.ceil(itemUpdate.detail.rows.length / 10);
  const currentPage = itemUpdate.detail.currentPage || 1;
  const rows = itemUpdate.detail.rows.slice((currentPage - 1) * 10, currentPage * 10);
  todoInput.value = '';
  let todoLists = '';
  content.innerHTML = '';
  doc.getElementById('finishDate').value = '';
  if (rows.length > 0) {
    rows.forEach((row) => {
      todoLists += itemDomCreate(row);
    });
  }
  content.innerHTML = todoLists;
  paginate(pages, currentPage);
  syncDom.innerText = 'SYNCED';
}

function paginate(pages, currentPage) {
  const pagination = doc.getElementById('pages');
  let paginationHTML = '<br><span page="0" class="pages"><<</span>';
  for (let i = 1; i <= pages; i += 1) {
    if (i === currentPage) {
      paginationHTML += `<span page="${i}" class="pages active">${i}</span>`;
    } else {
      paginationHTML += `<span page="${i}" class="pages">${i}</span>`;
    }
  }
  paginationHTML += '<span page="-1" class="pages">>></span>';
  pagination.innerHTML = paginationHTML;
  footer.insertBefore(pagination, syncDom);
}

function itemDomCreate(row) {
  const {
    complete,
    title,
    date,
    finishDate,
    _rev,
    _id,
  } = row;
  return `<div class="contentWrap"  _complete=${complete} _title=${title} _date=${date} _finishDate=${finishDate}  _id=${_id} _rev=${_rev}>
  <input class="itemComplete" type='checkbox' ${complete ? 'checked' : ''} >
  <input class="itemTitle" value=${title}>
  <input type="date" class="itemDate" value=${date}>
  <input type="date" class="itemFinishDate" value=${finishDate}>
  <span class='itemDelete' value=><button class='itemDelete'>x</button></span>
</div>`;
}
