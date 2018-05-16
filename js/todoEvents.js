
/**
 * 创建自定义事件模块
 *
 * @class TodoEvent
 *
 * @constructor
 *
 */
class TodoEvent {
  constructor() {
    this.handlers = {};
    this.rows = [];
  }
  subscribe(type, listener) {
    if (!(type in this.handlers)) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(listener);
  }
  off(type, listener) {
    let i,
      position = -1;
    const list = this.handlers[type],
      length = this.handlers[type].length;
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
      delete this.handlers[type];
    } else {
      this.handlers[type].splice(position, 1);
    }
  }
  publish(type, ...thisArgs) {
    const list = this.handlers[type],
      length = this.handlers[type].length;
    let i;
    for (i = length - 1; i >= 0; i -= 1) {
      list[i].apply(this, thisArgs);
    }
  }
  getTodoRows() {
    return this.rows;
  }
  setTodoRows(rows) {
    this.rows = rows;
  }
}
export default new TodoEvent();
