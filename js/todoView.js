const doc = document;
const syncDom = doc.getElementById('syncDom');
const prompt = doc.getElementById('prompt');
const todoInput = doc.getElementById('todoInput');
const content = doc.getElementById('content');
const filter = doc.getElementById('filter');
const title = doc.getElementById('title');
const footer = doc.getElementsByTagName('footer')[0];
// 用于计时
let time;
// 用于升降序
let descending = false;

const itemAdd = new CustomEvent('itemAdd');
const itemDelete = new CustomEvent('itemDelete', {
  detail: {},
});
const onSyncRecieve = new CustomEvent('onSyncRecieve', {
  detail: {},
});
const itemChange = new CustomEvent('itemChange', {
  detail: {},
});

doc.addEventListener('startSync', onStartSync);
doc.addEventListener('itemUpdate', onitemUpdate);
doc.addEventListener('click', onClickFunc);
doc.addEventListener('change', onChangeFunc);

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

// function onFilterDateChange(e) {
//   const changeValue = e.target.value || '';
//   const contentWrap = content.getElementsByClassName('contentWrap');
//   if (!changeValue) {
//     Array.from(contentWrap).forEach((item) => {
//       item.style.display = '';
//     });
//     return;
//   }
//   if (e.target.id === 'filterAdd') {
//     Array.from(contentWrap).forEach((item) => {
//       if (item.children[2].innerText === changeValue) {
//         item.style.display = '';
//       } else {
//         item.style.display = 'none';
//       }
//     });
//   } else if (e.target.id === 'filterComplete') {
//     Array.from(contentWrap).forEach((item) => {
//       if (item.children[3].innerText === changeValue) {
//         item.style.display = '';
//       } else {
//         item.style.display = 'none';
//       }
//     });
//   }
// }

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
  // item 确认弹窗
  const tr = ele.parentNode.parentNode;
  itemDelete.detail.id = tr.getAttribute('_id');
  itemDelete.detail.rev = tr.getAttribute('_rev');
  doc.dispatchEvent(itemDelete);
}

function onItemChange(e) {
  const item = e.target.parentNode;
  // 单击完成触发事件
  if (e.target.className === 'itemComplete') {
    itemChange.detail.complete = !item.children[0].hasAttribute('checked');
  } else {
    itemChange.detail.complete = item.children[0].hasAttribute('checked');
  }
  itemChange.detail._rev = item.getAttribute('_rev');
  itemChange.detail._id = item.getAttribute('_id');
  itemChange.detail.title = item.children[1].value;
  itemChange.detail.date = item.children[2].value;
  itemChange.detail.finishDate = item.children[3].value;
  doc.dispatchEvent(itemChange);
}

// function onSelectChange(e) {
//   const changeValue = e.target.value;
//   const contentWrap = content.getElementsByClassName('contentWrap');
//   Array.from(contentWrap).forEach((item) => {
//     const checkbox = item.children[0].children[0];
//     switch (changeValue) {
//       case 'completed':
//         if (checkbox.hasAttribute('checked')) {
//           item.style.display = '';
//         } else {
//           item.style.display = 'none';
//         }
//         break;
//       case 'unCompleted':
//         if (checkbox.hasAttribute('checked')) {
//           item.style.display = 'none';
//         } else {
//           item.style.display = '';
//         }
//         break;
//       default:
//         item.style.display = '';
//         break;
//     }
//   });
// }

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
  <input class="itemComplete" type='checkbox' ${complete ? 'checked' : ''} >
  <input class="itemTitle" value=${title}>
  <input type="date" class="itemDate" value=${date}>
  <input type="date" class="itemFinishDate" value=${finishDate}>
  <span class='itemDelete' value=><button class='itemDelete'>x</button></span>
</div>`;
}
