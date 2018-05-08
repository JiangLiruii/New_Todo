/**
 * 用于根据获取到的数据呈现视图和用户交互
 */
import { itemUpdate, itemAdd, itemDelete, onSyncRecieve, itemChange, doc } from './todoEvents';

const syncDom = doc.getElementById('syncDom');
const prompt = doc.getElementById('prompt');
const todoInput = doc.getElementById('todoInput');
const content = doc.getElementById('content');
const footer = doc.getElementsByTagName('footer')[0];
// 用于计时
let time;
// 用于升降序
let descending = false;
doc.addEventListener('startSync', onStartSync);
doc.addEventListener('itemUpdate', onitemUpdate);
doc.getElementById('title').addEventListener('click', onTitleClick);
doc.getElementById('addButton').addEventListener('click', onAdd);
doc.getElementById('pages').addEventListener('click', onPageClick);
doc.getElementById('content').addEventListener('click', onClickFunc);
doc.getElementById('filter').addEventListener('change', onFilterChange);
doc.getElementById('content').addEventListener('change', onItemChange);
/**
 *
 * @param {Event} e 点击事件
 * 对待办项列表中的点击事件进行区分响应
 */
function onClickFunc(e) {
  if (e.target.parentNode.className === 'itemDelete') {
    onDelete(e.target);
  }
}

function onFilterChange(e) {
  const data = onSyncRecieve.detail.data;
  if (e.target.id === 'filterAdd') {
    data.addDate = e.target.value;
  } else if (e.target.id === 'filterComplete') {
    data.finishDate = e.target.value;
  } else if (e.target.id === 'completeSelect') {
    data.complete = e.target.value;
  }
  syncDom.innerText = 'SYNCING';
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
/**
 *
 * @param {event} e 触发事件
 * 当点击title时进行排序函数
 */
function onTitleClick(e) {
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
    itemAdd.detail.data = {
      _id: date.getTime().toString(),
      _rev: null,
      title: todoInput.value.trim(),
      date: newDate,
      finishDate: finishDate || newDate,
      complete: false,
    };
    doc.dispatchEvent(itemAdd);
  }
}

function onDelete(ele) {
  // item 确认弹窗
  const item = ele.parentNode.parentNode;
  itemDelete.detail.data = {
    id: item.getAttribute('_id'),
    rev: item.getAttribute('_rev'),
  };
  doc.dispatchEvent(itemDelete);
}
/**
 * @param {event} e change事件
 * 当有代办项改变时触发
 */
function onItemChange(e) {
  const item = e.target.parentNode;
  let complete = '';
  // 单击完成触发事件
  if (e.target.className === 'itemComplete') {
    complete = !item.children[0].hasAttribute('checked');
    item.setAttribute('_complete', itemChange.detail.complete);
  } else {
    complete = item.children[0].hasAttribute('checked');
  }
  itemChange.detail.data = {
    complete,
    _rev: item.getAttribute('_rev'),
    _id: item.getAttribute('_id'),
    title: item.children[1].value,
    date: item.children[2].value,
    finishDate: item.children[3].value,
  };
  doc.dispatchEvent(itemChange);
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
  const data = onSyncRecieve.detail.data;
  syncDom.innerText = 'SYNCING';
  data.complete = 'all';
  data.addDate = '';
  data.finishDate = '';
  doc.dispatchEvent(onSyncRecieve);
}
/**
 * 最重要的更新函数,在以下情况调用
 * 1 初始化页面时
 * 2 待办项增加时
 * 3 待办项删除时
 * 4 当待办数据内容改变时
 * 5 对待办项进行排序时
 * 6 筛选条件改变时
 * 7 页面跳转时
 */
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
/**
 * @param {alldocs.doc.row} row 待办项
 * 创建待办项的DOM描述
 */
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
