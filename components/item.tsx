import * as React from 'react'
import {AppContext} from './app'
import PropTypes from '../node_modules/prop-types/index';


interface ItemProp {
  item: {complete:boolean,detail:string,addDate:string,finishDate:string,_id:string,_rev:string};
}

interface ItemState {

}

export default class Item extends React.Component<ItemProp, ItemState> {
  context:AppContext;
  constructor(props: ItemProp) {
    super(props);
  }

  static contextTypes= {
    itemChange:PropTypes.func,
    itemDelete:PropTypes.func,
};;


  render() {
    const { complete, detail, addDate, finishDate, _id, _rev } = this.props.item;
    return (<div className="contentWrap">
      <input className="itemComplete" type='checkbox' { ...complete ? 'checked' : ''} onClick={()=>this.context.itemChange(Object.assign({},this.props.item,{'complete':!complete}))} />
      <input className="itemTitle" value={detail} onChange={()=>this.context.itemChange(this.props.item)}  />
      <input type="date" className="itemDate" value={addDate} onChange={()=>this.context.itemChange(this.props.item)} />
      <input type="date" className="itemFinishDate" value={finishDate} onChange={()=>this.context.itemChange(this.props.item)} />
      <span className='itemDelete'> <button className='itemDelete' onChange={()=>this.context.itemDelete(this.props.item)}>x</button></span>
    </div>)
  }
  private complete() {

  }
}