import * as React from 'react';
import { AppContext, filterData } from './app'
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
    console.log('itemList',items);
    
    return (
      <div>
        <div id="title"  onClick={(e)=>this.context.titleClick(e)}>
        <span className="complete">确认完成</span>
        <span className="detail">待办描述</span>
        <span className="addDate">添加时间</span>
        <span className="finishDate">完成时间</span>
        <span className="itemDelete">删除待办</span></div>
        <div>{items.map((item,index) =><Item item={item} key={index} />)}
        </div>
      </div>
    );
  }
}