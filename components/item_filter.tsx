import * as React from 'react';

interface ItemFilterStates {

}

interface ItemFilterProps {
  itemFilter:Function;
}

export default class ItemFilter extends React.Component<ItemFilterProps, ItemFilterStates> {
  constructor(props: ItemFilterProps) {
    super(props);
  }
  public render() {
    return (<div id="filter" ref="filterContainer" onChange={(e)=>this.props.itemFilter(e)}>
              <div>完成情况筛选
              <select id="completeSelect" defaultValue="all">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="unCompleted">Uncompleted</option>
              </select></div>
              <div>添加时间筛选
              <input type="date" id="filterAdd" className="filter" /></div>
              <div>完成时间筛选
              <input type="date" id="filterComplete" className="filter" /></div>
            </div>)
  }
}