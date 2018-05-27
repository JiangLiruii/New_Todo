(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['./todoEvents'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('./todoEvents'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.todoEvents);
    global.todoView = mod.exports;
  }
})(this, function (_todoEvents) {
  'use strict';

  var _todoEvents2 = _interopRequireDefault(_todoEvents);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var doc = document; /**
                       * 用于根据获取到的数据呈现视图和用户交互
                       */

  var syncDom = doc.getElementById('syncDom');
  var prompt = doc.getElementById('prompt');
  var todoInput = doc.getElementById('todoInput');
  var content = doc.getElementById('content');
  var footer = doc.getElementsByTagName('footer')[0];
  // 用于计时
  var time = void 0;
  // 用于升降序
  var descending = false;

  _todoEvents2.default.subscribe('startSync', onStartSync);
  _todoEvents2.default.subscribe('itemUpdate', onitemUpdate);
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
    var data = {
      addDate: doc.getElementById('filterAdd').value,
      finishDate: doc.getElementById('filterComplete').value,
      complete: doc.getElementById('completeSelect').value
    };
    if (e.target.id === 'filterAdd') {
      data.addDate = e.target.value;
    } else if (e.target.id === 'filterComplete') {
      data.finishDate = e.target.value;
    } else if (e.target.id === 'completeSelect') {
      data.complete = e.target.value;
    }
    syncDom.innerText = 'SYNCING';
    _todoEvents2.default.publish('onSyncRecieve', data);
  }

  function onPageClick(e) {
    var nextPage = +e.target.getAttribute('page');
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
    onitemUpdate(nextPage);
  }
  /**
   *
   * @param {Event} e 触发事件
   * 当点击title时进行排序函数
   */
  function onTitleClick(e) {
    var className = '' + e.target.className.replace('item', '');
    className = className[0].toLowerCase() + className.substr(1);

    var sortedContent = _todoEvents2.default.getTodoRows();
    if (!descending) {
      sortedContent.sort(function (itemA, itemB) {
        return itemA[className] < itemB[className];
      });
      descending = true;
    } else {
      sortedContent.sort(function (itemA, itemB) {
        return itemA[className] > itemB[className];
      });
      descending = false;
    }
    _todoEvents2.default.setTodoRows(sortedContent);
    _todoEvents2.default.publish('itemUpdate');
  }

  function onAdd() {
    var finishDate = doc.getElementById('finishDate').value;
    var date = new Date();
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate();
    var newDate = date.getFullYear() + '-' + month + '-' + day;
    if (todoInput.value.trim() === '') {
      onEmpty();
    } else {
      var data = {
        _id: date.getTime().toString(),
        _rev: null,
        title: todoInput.value.trim(),
        date: newDate,
        finishDate: finishDate || newDate,
        complete: false
      };
      _todoEvents2.default.publish('itemAdd', data);
    }
  }

  function onDelete(ele) {
    // item 确认弹窗
    var item = ele.parentNode.parentNode;
    var data = {
      id: item.getAttribute('_id'),
      rev: item.getAttribute('_rev')
    };
    _todoEvents2.default.publish('itemDelete', data);
  }
  /**
   * @param {event} e change事件
   * 当有代办项改变时触发
   */
  function onItemChange(e) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var item = e.target.parentNode;
    var complete = '';
    // 单击完成触发事件
    if (e.target.className === 'itemComplete') {
      complete = !item.children[0].hasAttribute('checked');
      item.setAttribute('_complete', data.complete);
    } else {
      complete = item.children[0].hasAttribute('checked');
    }
    data = {
      complete: complete,
      _rev: item.getAttribute('_rev'),
      _id: item.getAttribute('_id'),
      title: item.children[1].value,
      date: item.children[2].value,
      finishDate: item.children[3].value
    };
    _todoEvents2.default.publish('itemChange', data);
  }

  function onEmpty() {
    if (time) {
      clearTimeout(time);
    }
    prompt.innerText = '内容不可为空';
    prompt.style.color = 'red';
    time = setTimeout(function () {
      time = '';
      prompt.innerText = '';
    }, 2000);
  }

  function onStartSync() {
    var data = {};
    syncDom.innerText = 'SYNCING';
    data.complete = 'all';
    data.addDate = '';
    data.finishDate = '';
    _todoEvents2.default.publish('onSyncRecieve', data);
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
    var currentPage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var pages = Math.ceil(_todoEvents2.default.getTodoRows().length / 10);
    var rows = _todoEvents2.default.getTodoRows().slice((currentPage - 1) * 10, currentPage * 10);
    todoInput.value = '';
    var todoLists = '';
    content.innerHTML = '';
    doc.getElementById('finishDate').value = '';
    if (rows.length > 0) {
      rows.forEach(function (row) {
        todoLists += itemDomCreate(row);
      });
    }
    content.innerHTML = todoLists;
    paginate(pages, currentPage);
    syncDom.innerText = 'SYNCED';
  }

  function paginate(pages, currentPage) {
    var pagination = doc.getElementById('pages');
    var paginationHTML = '<br><span page="0" class="pages"><<</span>';
    for (var i = 1; i <= pages; i += 1) {
      if (i === currentPage) {
        paginationHTML += '<span page="' + i + '" class="pages active">' + i + '</span>';
      } else {
        paginationHTML += '<span page="' + i + '" class="pages">' + i + '</span>';
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
    var complete = row.complete,
        title = row.title,
        date = row.date,
        finishDate = row.finishDate,
        _rev = row._rev,
        _id = row._id;

    return '<div class="contentWrap"  _complete=' + complete + ' _title=' + title + ' _date=' + date + ' _finishDate=' + finishDate + '  _id=' + _id + ' _rev=' + _rev + '>\n    <input class="itemComplete" type=\'checkbox\' ' + (complete ? 'checked' : '') + ' >\n    <input class="itemTitle" value=' + title + '>\n    <input type="date" class="itemDate" value=' + date + '>\n    <input type="date" class="itemFinishDate" value=' + finishDate + '>\n    <span class=\'itemDelete\' value=><button class=\'itemDelete\'>x</button></span>\n  </div>';
  }
});