
/**
 * 创建自定义事件模块
 *
 * @class TodoEvent
 *
 * @constructor
 *
 */
const handlers = {};
let rows = [];

class TodoEvent {
  subscribe(type, listener) {
    if (!(type in handlers)) {
      handlers[type] = [];
    }
    handlers[type].push(listener);
  }
  off(type, listener) {
    let i,
      position = -1;
    const list = handlers[type],
      length = handlers[type].length;
    for (i = length - 1; i >= 0; i -= 1) {
      if (list[i] === listener) {
        position = i;
        break;
      }
    }
    if (position === -1) {
      return;
    }
    if (length === 1) {
      delete handlers[type];
    } else {
      handlers[type].splice(position, 1);
    }
  }
  publish(type, ...thisArgs) {
    const list = handlers[type],
      length = handlers[type].length;
    let i;
    for (i = length - 1; i >= 0; i -= 1) {
      list[i].apply(this, thisArgs);
    }
  }
  getTodoRows() {
    return rows;
  }
  setTodoRows(newRows) {
    rows = newRows;
  }
}
export default new TodoEvent();
