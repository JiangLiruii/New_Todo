/**
 * 创建公共变量,包括自定义事件,document对象和db对象
 */
const doc = document;
const itemAdd = new CustomEvent('itemAdd', {
  detail: { data: {} },
});
const itemDelete = new CustomEvent('itemDelete', {
  detail: { data: {} },
});
const onSyncRecieve = new CustomEvent('onSyncRecieve', {
  detail: { data: {} },
});
const itemChange = new CustomEvent('itemChange', {
  detail: { data: {} },
});
const itemUpdate = new CustomEvent('itemUpdate', {
  detail: { data: {}, rows: [] },
});
const startSync = new CustomEvent('startSync');
const db = new PouchDB('todos');
export { doc, itemAdd, itemDelete, onSyncRecieve, itemChange, itemUpdate, startSync, db };
