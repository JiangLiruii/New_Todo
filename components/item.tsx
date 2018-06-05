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
    const item = this.props.item;
    return (<div className="contentWrap">
      <span className="itemComplete"><input type='checkbox' defaultChecked={ item.complete } onClick={()=>this.context.itemChange(Object.assign({},item,{'complete':!item.complete}))} /></span>
      <span className="itemTitle"><input value={item.detail} onChange={(e)=>this.context.itemChange(Object.assign({},this.props.item,{'detail':e.target.value}))}  /></span>
      <span className="itemDate"><input type="date" value={item.addDate} onChange={(e)=>this.context.itemChange(Object.assign({},this.props.item,{'addDate':e.target.value}))} /></span>
      <span className="itemFinishDate"><input type="date" value={item.finishDate} onChange={(e)=>this.context.itemChange(Object.assign({},this.props.item,{'finishDate':e.target.value}))} /></span>
      <span className='itemDelete'> <button onClick={()=>this.context.itemDelete(item._id,item._rev)}>x</button></span>
    </div>)
  }
  private complete() {

  }
}