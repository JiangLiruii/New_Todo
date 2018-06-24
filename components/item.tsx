import * as React from 'react'
import { dbHandles } from "./app";


interface ItemProp {
  item: { complete: boolean, detail: string, addDate: string, finishDate: string, _id: string, _rev: string },
}

interface ItemState {
  detail: string,
}

export default class Item extends React.Component<ItemProp, ItemState> {
  constructor(props: ItemProp) {
    super(props);
    console.log(this.props);

    this.state = {
      detail: this.props.item.detail,
    }
  }

  render() {
    const item = this.props.item;
    return (
      <dbHandles.Consumer>
        {({ itemChange, itemDelete }) => (
          <div className="contentWrap" >
            <span className="complete"><input type='checkbox' checked={item.complete} onChange={this.onDataChange.bind(this, itemChange)} /></span>
            <span className="detail"><input value={this.state.detail} onChange={this.onChange.bind(this)} onBlur={this.onDataChange.bind(this)} /></span>
            <span className="addDate">{item.addDate}</span>
            <span className="finishDate"><input type="date" value={item.finishDate} onChange={this.onDataChange.bind(this)} /></span>
            <span className='itemDelete'><button onClick={() => itemDelete(item._id, item._rev)}>x</button></span>
          </div>
        )}
      </dbHandles.Consumer>
    )
  }
  /**
   * 使input组件可控，且减少数据库读取操作，只在光标移出时进行更新。
   * @param e changeEvent
   */
  private onChange(e) {
    this.setState({
      detail: e.target.value,
    })
  }
  /**
   * 数据更新时调用
   * @param e changevent
   */
  private onDataChange(e, itemChange) {
    const key = e.target.parentNode.className;
    const item = this.props.item;
    let value = e.target.value;
    if (key === 'complete') {
      value = !item.complete
    }
    if (item[key] === value) return;
    item[key] = value;
    itemChange(item)
  }
}