const doc = document
const syncDom = doc.getElementById('syncDom');
const prompt = doc.getElementById('prompt');
const todoInput = doc.getElementById('todoInput');
const content = doc.getElementById('content');
const completeChange = doc.getElementById('completeSelect')
const title = doc.getElementById('title')
    // 用于计数
let time;

const itemAdd = new CustomEvent('itemAdd');
const itemDelete = new CustomEvent('itemDelete', { detail: {} })
const onSyncRecieve = new CustomEvent('onSyncRecieve');
const emptyInput = new CustomEvent('emptyInput');
const startSync = new CustomEvent('startSync');
const itemCompleteChange = new CustomEvent('itemCompleteChange', { detail: {} });

doc.addEventListener('emptyInput', onEmpty);
doc.addEventListener('startSync', onStartSync);
doc.addEventListener('itemUpdate', onitemUpdate);
doc.addEventListener('click', onClickFunc);
completeChange.addEventListener('change', onSelectChange)
title.addEventListener('click', onTitleClick)


function onClickFunc(e) {
    if (e.target.parentNode.className === 'itemDelete') {
        onDelete(e.target);
    } else if (e.target.parentNode.className === 'itemComplete') {
        onComplete(e.target);
    } else if (e.target.id === 'addButton') {
        onAdd();
    }
}

function onTitleClick(e) {
    // 根据e.target.class来排序
    const className = `_${e.target.className.replace('item', '').toLowerCase()}`
    Array.from(doc.getElementsByClassName('contentWrap')).sort((itemA, itemB) => {
        console.log(itemA.getAttribute(className) > itemB.getAttribute(className));
        return !(itemA.getAttribute(className) > itemB.getAttribute(className));
    })

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
    doc.dispatchEvent(itemCompleteChange);
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
    doc.dispatchEvent(onSyncRecieve);
}

function onitemUpdate(e) {
    let rows = e.detail.rows;
    let todoLists = '';
    content.innerHTML = '';
    todoInput.value = '';
    if (rows.length > 0) {
        rows.forEach((row) => {
            domSync(row);

            const todolist = ;
            todoLists += todolist;
        });
    }
    content.innerHTML = todoLists;
    syncDom.innerText = 'SYNCED';
}

function domSync(content) {
    const {
        doc: {
            complete,
            title,
            date,
            finishDate
        },
    } = content;
    return `<div class="contentWrap"  _complete=${complete} _title=${title} _date=${date} _finishDate=${finishDate}  _id=${row.id} _rev=${row.doc._rev}>
  <span class="itemComplete"><input type='checkbox' ${complete ? 'checked' : ''} ></span>
  <span class="itemTitle">${title}</span>
  <span class="itemDate">${date}</span>
  <span class="itemFinishDate">${finishDate}</span>
  <span class='itemDelete'><button>x</button></span>
</div>`
}