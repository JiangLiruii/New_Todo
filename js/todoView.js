(function start($) {
  function onEmpty() {
    $('#todoInput').attr('placeholder', '内容不可为空');
    $('#todoInput').placeholder.css('color', 'red');
  }
  $(document).on('emptyInput', onEmpty);

  function itemUpdate() {}
  $(document).on('itemUpdate', () => {
    $('#todoInput').val('');
    // 更新列表
  });
  $(document).on('selectUpdate', itemUpdate);
}(jQuery));
