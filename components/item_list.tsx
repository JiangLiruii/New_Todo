import * as React from 'react';
import {AppContext} from './app'
import Item from './item';
import PropTypes from '../node_modules/prop-types/index';

interface ItemListProps {
  list: Array<ItemDetail>,
}

export interface ItemDetail {
  complete: boolean,
  detail: string,
  addDate: string,
  finishDate: string,
  _id: string,
  _rev: string
}
interface ItemListState {

}

export default class ItemList extends React.Component<ItemListProps, ItemListState> {
  context: AppContext;
  constructor(props: ItemListProps) {
    super(props);
  }
  static contextTypes ={
    titleClick: PropTypes.func
  }
  render() {
    const items = this.props.list;
    return (<div onClick={(e)=>this.context.titleClick(e)}><div id="title"><span className="itemComplete">确认完成</span>
      <span className="itemDetail">待办描述</span>
      <span className="itemAddDate">添加时间</span>
      <span className="itemFinishDate">完成时间</span>
      <span className="itemDelete">删除待办</span></div>
      <div>{items.map((item,index) => <Item item={item} key={index}/>)}</div></div>);
  }
}