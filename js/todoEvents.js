/**
 * 创建公共变量,包括自定义事件,document对象和db对象
 */
export const doc = document;
export const db = new PouchDB('todos');
/**
 * @class TodoEvent
 *
 * @constructor handlers,rows
 *
 */
function TodoEvent() {
  this.handlers = {};
  this.rows = [];
}
TodoEvent.prototype.subscribe = function (type, listener) {
  if (!(type in this.handlers)) {
    this.handlers[type] = [];
  }
  this.handlers[type].push(listener);
};
TodoEvent.prototype.off = function (type, listener) {
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
};
TodoEvent.prototype.publish = function (type, ...thisArgs) {
  console.log(thisArgs);
  const list = this.handlers[type],
    length = this.handlers[type].length;
  let i;
  for (i = length - 1; i >= 0; i -= 1) {
    list[i].apply(this, thisArgs);
  }
};
TodoEvent.prototype.getTodoRows = function () {
  return this.rows;
};
TodoEvent.prototype.setTodoRows = function (rows) {
  this.rows = rows;
};
export const todoEvent = new TodoEvent();
