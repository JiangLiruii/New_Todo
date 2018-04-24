(function ($) {
  function addList() {
    const todo = $('#todoInput').val();
    if (todo === '') {
      // 弹出提示框输入待办项
    } else {
      $(document).trigger('itemUpdate')
      // 传给数据库,完成数据库写入后回调更新view
    }
  }
  $(document).ready(
    function () {
      $('#addButton').on('click', addList);
    }
  )
}(jQuery))