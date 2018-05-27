import * as React from 'react';
import Item from './item';
interface ItemListProps {
  list: Array<ItemDetail>,
}

interface ItemDetail {
  complete: boolean,
  detail: string,
  addDate: Date,
  finishDate: Date,
  _id: string,
  _rev: string
}
interface ItemListState {

}

export default class ItemList extends React.Component<ItemListProps, ItemListState> {
  constructor(props: ItemListProps) {
    super(props);
    this.setState({

    })
  }
  render() {
    const items = this.props.list;
    return (<div><span className="itemComplete">确认完成</span>
      <span className="itemTitle">待办描述</span>
      <span className="itemDate">添加时间</span>
      <span className="itemFinishDate">完成时间</span>
      <span className="itemDelete">删除待办</span>
      {items.map(item => <Item item={item} />)}</div>);
  }
}