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
            <span>完成情况筛选</span>
            <select id="completeSelect" defaultValue="all">
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="unCompleted">Uncompleted</option>
            </select>
            <br />
            <span>添加时间筛选</span>
            <input type="date" id="filterAdd" className="filter" />
            <span>完成时间筛选</span>
            <input type="date" id="filterComplete" className="filter" />
          </div>)
  }
}