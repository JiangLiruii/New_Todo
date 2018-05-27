import * as React from "react";

interface ItemProp {
  item: any;
}

interface ItemState {

}

export default class Item extends React.Component<ItemProp, ItemState> {
  constructor(props: ItemProp) {
    super(props);
  }
  render() {
    const { complete, detail, addDate, finishDate, _id, _rev } = this.props.item;
    return (<div className="contentWrap" _complete={complete} _title={detail} _date={addDate} _finishDate={finishDate} _id={_id} _rev={_rev}>
      <input className="itemComplete" type='checkbox' { complete ? 'checked' : ''} />
      <input className="itemTitle" value={detail} />
      <input type="date" className="itemDate" value={addDate} />
      <input type="date" className="itemFinishDate" value={finishDate} />
      <span className='itemDelete'> <button className='itemDelete'>x</button></span>
    </div>)
  }
}